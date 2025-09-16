import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Recruiter } from "../models/recruiter.model.js"; 

// Recruiter Signup
const recruiterSignup = async (req, res) => {
  const { uid, email } = req.user;
  const { name, phone, designation, companyId } = req.body;

  try {
    const existingRecruiter = await Recruiter.findOne({ firebaseId: uid });
    if (existingRecruiter) {
      return res.status(400).json({ message: "Recruiter already exists" });
    }

    const newRecruiter = await Recruiter.create({
      firebaseId: uid,
      email,
      name,
      phone,
      designation,
      companyId,
    });

    return res
      .status(201)
      .json({ message: "Recruiter created successfully", user: newRecruiter });
  } catch (error) {
    console.error("Error during recruiter signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Recruiter Login
const recruiterLogin = async (req, res) => {
  const { uid } = req.user;

  try {
    const recruiter = await Recruiter.findOne({ firebaseId: uid });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    return res.status(200).json({ message: "Login successful", user: recruiter });
  } catch (error) {
    console.error("Error during recruiter login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Post Job
const postJob = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const { title, description, salaryRange, preferences } = req.body;

    if (!title || !description || !salaryRange?.min || !salaryRange?.max) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const newJob = await Job.create({
      title,
      description,
      recruiter: recruiterId,
      salaryRange,
      preferences,
    });

    // Update recruiter stats
    await Recruiter.findByIdAndUpdate(recruiterId, {
      $inc: { "activityEngagement.jobsPosted": 1 },
      $push: { "activityEngagement.activeJobs": newJob._id },
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job: newJob,
    });
  } catch (error) {
    console.error("Error posting job:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, could not post job",
      error: error.message,
    });
  }
};

// Get Applications for a Job
const getApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user._id;

    const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or not owned by recruiter" });
    }

    const applications = await Application.find({ job: jobId })
      .populate({
        path: "candidate",
        select:
          "email profile.firstName profile.lastName education user_skills",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobId,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching applications",
      error: error.message,
    });
  }
};
const updateRecruiterProfile = async (req, res) => {
  try {
    const recruiterId = req.user._id; // recruiter comes from auth

    // Fields allowed to update (to prevent messing with firebaseId/verification status directly)
    const allowedUpdates = [
      "name",
      "email",
      "phone",
      "profilePicture",
      "designation",
      "companyId",
    ];

    // Extract only allowed fields from req.body
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Update recruiter
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      recruiterId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("companyId", "name industry location logo");

    if (!updatedRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      recruiter: updatedRecruiter,
    });
  } catch (error) {
    console.error("Error updating recruiter profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};
// Get Analytics for Recruiter
const getRecruiterAnalytics = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    // Get total jobs posted by this recruiter
    const totalJobsPosted = await Job.countDocuments({ recruiter: recruiterId });

    // Get active jobs (jobs posted in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeJobs = await Job.countDocuments({ 
      recruiter: recruiterId, 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Get total applications received across all jobs
    const totalApplications = await Application.countDocuments({
      job: { $in: await Job.find({ recruiter: recruiterId }).distinct('_id') }
    });

    // Get applications by status
    const applicationsByStatus = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData'
        }
      },
      {
        $match: {
          'jobData.recruiter': recruiterId
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get applications received in last 30 days
    const recentApplications = await Application.countDocuments({
      job: { $in: await Job.find({ recruiter: recruiterId }).distinct('_id') },
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get top performing jobs (by application count)
    const topJobs = await Job.aggregate([
      {
        $match: { recruiter: recruiterId }
      },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications'
        }
      },
      {
        $project: {
          title: 1,
          createdAt: 1,
          applicationCount: { $size: '$applications' },
          hiredCount: {
            $size: {
              $filter: {
                input: '$applications',
                cond: { $eq: ['$$this.status', 'hired'] }
              }
            }
          }
        }
      },
      {
        $sort: { applicationCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get monthly job posting trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await Job.aggregate([
      {
        $match: {
          recruiter: recruiterId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          jobsPosted: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get average applications per job
    const averageApplicationsPerJob = totalJobsPosted > 0 ? (totalApplications / totalJobsPosted).toFixed(2) : 0;

    // Get conversion rate (hired/applied)
    const hiredCount = applicationsByStatus.find(item => item._id === 'hired')?.count || 0;
    const conversionRate = totalApplications > 0 ? ((hiredCount / totalApplications) * 100).toFixed(2) : 0;

    // Get recent activity (last 10 applications)
    const recentActivity = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData'
        }
      },
      {
        $match: {
          'jobData.recruiter': recruiterId
        }
      },
      {
        $lookup: {
          from: 'candidates',
          localField: 'candidate',
          foreignField: '_id',
          as: 'candidateData'
        }
      },
      {
        $project: {
          status: 1,
          createdAt: 1,
          jobTitle: { $arrayElemAt: ['$jobData.title', 0] },
          candidateName: { 
            $concat: [
              { $arrayElemAt: ['$candidateData.profile.firstName', 0] },
              ' ',
              { $arrayElemAt: ['$candidateData.profile.lastName', 0] }
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const analytics = {
      overview: {
        totalJobsPosted,
        activeJobs,
        totalApplications,
        recentApplications,
        averageApplicationsPerJob: parseFloat(averageApplicationsPerJob),
        conversionRate: parseFloat(conversionRate)
      },
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topJobs,
      monthlyTrend: monthlyTrend.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        jobsPosted: item.jobsPosted
      })),
      recentActivity
    };

    return res.status(200).json({
      success: true,
      message: "Analytics retrieved successfully",
      analytics
    });

  } catch (error) {
    console.error("Error fetching recruiter analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
      error: error.message
    });
  }
};

export { recruiterSignup, recruiterLogin, postJob, getApplications, updateRecruiterProfile, getRecruiterAnalytics };
