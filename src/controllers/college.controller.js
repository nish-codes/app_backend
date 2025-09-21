import mongoose from "mongoose";
import { College } from "../models/college.model.js";
import { Student } from "../models/student.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

// College Signup
const collegeSignup = async (req, res) => {
  const { uid, email } = req.user;
  const { name, accessEmail, accessPassword, profile } = req.body;


  
  try {
    const existingCollege = await College.findOne({ firebaseId: uid });
    if (existingCollege) {
      return res.status(400).json({ message: "College already exists" });
    }

    const newCollege = await College.create({
      firebaseId: uid,
      email,
      name,
      accessEmail,
      accessPassword,
      profile,
    });

    return res
      .status(201)
      .json({ message: "College created successfully", college: newCollege });
  } catch (error) {
    console.error("Error during college signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// College Login
const collegeLogin = async (req, res) => {
  const { uid } = req.user;

  try {
    const college = await College.findOne({ firebaseId: uid });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    return res.status(200).json({ message: "Login successful", college });
  } catch (error) {
    console.error("Error during college login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get Students from College
const getCollegeStudents = async (req, res) => {
  try {
    const collegeId = req.user._id;
    const college = await College.findById(collegeId);
    
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    // Get students from this college with application statistics using aggregation
    const studentsWithApplications = await Student.aggregate([
      // 1. Match students from a specific college
      { $match: { "education.college": college.name } },

      // 2. Lookup applications for each student
      {
        $lookup: {
          from: "applications",      // collection name of applications
          localField: "_id",         // student's _id
          foreignField: "candidate", // candidate field in applications
          as: "applications"
        }
      },

      // 3. Populate job info in applications
      {
        $lookup: {
          from: "jobs",
          localField: "applications.job",
          foreignField: "_id",
          as: "jobDetails"
        }
      },

    
      {
        $addFields: {
          totalApplications: { $size: "$applications" },
          hiredApplications: {
            $size: {
              $filter: { input: "$applications", cond: { $eq: ["$$this.status", "hired"] } }
            }
          }
        }
      },

      // 5. Project only needed fields
      {
        $project: {
          email: 1,
          profile: 1,
          education: 1,
          user_skills: 1,
          createdAt: 1,
          totalApplications: 1,
          hiredApplications: 1,
          applications: 0, // remove full applications array
          jobDetails: 0    // remove job details if not needed in the list view
        }
      },

      // 6. Sort by creation date
      { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      college: {
        name: college.name,
        totalStudents: studentsWithApplications.length
      },
      students: studentsWithApplications
    });
  } catch (error) {
    console.error("Error fetching college students:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching students",
      error: error.message
    });
  }
};

// Get Student Details with Applications
const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const collegeId = req.user._id;
    
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    // Get detailed student information with applications using aggregation
    const studentDetails = await Student.aggregate([
      // 1. Match the specific student and verify they belong to this college
      { 
        $match: { 
          _id: mongoose.Types.ObjectId(studentId),
          "education.college": college.name 
        } 
      },

      // 2. Lookup applications for this student
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "candidate",
          as: "applications"
        }
      },

      // 3. Lookup job details for each application
      {
        $lookup: {
          from: "jobs",
          localField: "applications.job",
          foreignField: "_id",
          as: "jobDetails"
        }
      },

      // 4. Lookup recruiter details
      {
        $lookup: {
          from: "recruiters",
          localField: "jobDetails.recruiter",
          foreignField: "_id",
          as: "recruiterDetails"
        }
      },

      // 5. Lookup college details for on-campus opportunities
      {
        $lookup: {
          from: "colleges",
          localField: "jobDetails.college",
          foreignField: "_id",
          as: "collegeDetails"
        }
      },

      // 6. Calculate comprehensive application statistics
      {
        $addFields: {
          applicationStats: {
            totalApplications: { $size: "$applications" },
            statusBreakdown: {
              applied: {
                $size: {
                  $filter: { input: "$applications", cond: { $eq: ["$$this.status", "applied"] } }
                }
              },
              shortlisted: {
                $size: {
                  $filter: { input: "$applications", cond: { $eq: ["$$this.status", "shortlisted"] } }
                }
              },
              rejected: {
                $size: {
                  $filter: { input: "$applications", cond: { $eq: ["$$this.status", "rejected"] } }
                }
              },
              hired: {
                $size: {
                  $filter: { input: "$applications", cond: { $eq: ["$$this.status", "hired"] } }
                }
              }
            },
            
          }
        }
      },

      // 7. Project the final result
      {
        $project: {
          email: 1,
          phone: 1,
          profile: 1,
          education: 1,
          user_skills: 1,
          createdAt: 1,
          applicationStats: 1,
          applications: 1,
          jobDetails: 1,
          recruiterDetails: 1,
          collegeDetails: 1
        }
      }
    ]);

    if (studentDetails.length === 0) {
      return res.status(404).json({ message: "Student not found or not from this college" });
    }

    const student = studentDetails[0];

    return res.status(200).json({
      success: true,
      message: "Student details retrieved successfully",
      student: {
        _id: student._id,
        email: student.email,
        phone: student.phone,
        profile: student.profile,
        education: student.education,
        user_skills: student.user_skills,
        createdAt: student.createdAt
      },
      applicationStats: student.applicationStats,
      applications: student.applications.map(app => ({
        ...app,
        job: student.jobDetails.find(job => job._id.toString() === app.job.toString())
      }))
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching student details",
      error: error.message
    });
  }
};

// Post On-Campus Opportunity
const postOnCampusOpportunity = async (req, res) => {
  try {
    const collegeId = req.user._id;
    const { title, description, salaryRange, preferences, applicationLink } = req.body;

    if (!title || !description || !salaryRange?.min || !salaryRange?.max || !applicationLink) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled including application link" });
    }

    const newOpportunity = await Job.create({
      title,
      description,
      college: collegeId,
      jobType: "on-campus",
      salaryRange,
      preferences,
      applicationLink,
    });

    // Update college stats
    await College.findByIdAndUpdate(collegeId, {
      $inc: { "activityEngagement.opportunitiesPosted": 1 },
      $push: { "activityEngagement.activeOpportunities": newOpportunity._id },
    });

    return res.status(201).json({
      success: true,
      message: "On-campus opportunity posted successfully",
      opportunity: newOpportunity,
    });
  } catch (error) {
    console.error("Error posting opportunity:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, could not post opportunity",
      error: error.message,
    });
  }
};

// Get On-Campus Opportunities Posted by College
const getCollegeOpportunities = async (req, res) => {
  try {
    const collegeId = req.user._id;

    // Get opportunities posted by this college
    const opportunities = await Job.find({ college: collegeId, jobType: "on-campus" })
      .populate("college", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "College opportunities retrieved successfully",
      opportunities
    });
  } catch (error) {
    console.error("Error fetching college opportunities:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching opportunities",
      error: error.message
    });
  }
};

// Update College Profile
const updateCollegeProfile = async (req, res) => {
  try {
    const collegeId = req.user._id;

    // Fields allowed to update
    const allowedUpdates = [
      "name",
      "email",
      "accessEmail",
      "profile"
    ];

    // Extract only allowed fields from req.body
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Update college
    const updatedCollege = await College.findByIdAndUpdate(
      collegeId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedCollege) {
      return res.status(404).json({ message: "College not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      college: updatedCollege,
    });
  } catch (error) {
    console.error("Error updating college profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

// Get College Analytics
const getCollegeAnalytics = async (req, res) => {
  try {
    const collegeId = req.user._id;
    const college = await College.findById(collegeId);
    
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    // Get total students from this college
    const totalStudents = await Student.countDocuments({ "education.college": college.name });

    // Get total opportunities posted
    const totalOpportunities = await Job.countDocuments({ college: collegeId, jobType: "on-campus" });

    // Get total applications from college students
    const students = await Student.find({ "education.college": college.name }).distinct('_id');
    const totalApplications = await Application.countDocuments({ candidate: { $in: students } });

    // Get applications by status from college students
    const applicationsByStatus = await Application.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'candidate',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      {
        $match: {
          'studentData.education.college': college.name
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get placement statistics
    const placementStats = {
      totalStudents,
      placedStudents: await Student.countDocuments({ 
        "education.college": college.name,
        _id: { $in: await Application.distinct('candidate', { status: 'hired' }) }
      }),
      totalApplications,
      opportunitiesPosted: totalOpportunities
    };

    // Get monthly placement trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyPlacementTrend = await Application.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'candidate',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      {
        $match: {
          'studentData.education.college': college.name,
          status: 'hired',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          placements: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const analytics = {
      overview: {
        ...placementStats,
        placementRate: totalStudents > 0 ? 
          ((placementStats.placedStudents / totalStudents) * 100).toFixed(2) : 0,
        averageApplicationsPerStudent: totalStudents > 0 ? 
          (totalApplications / totalStudents).toFixed(2) : 0
      },
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      monthlyPlacementTrend: monthlyPlacementTrend.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        placements: item.placements
      }))
    };

    return res.status(200).json({
      success: true,
      message: "College analytics retrieved successfully",
      analytics
    });

  } catch (error) {
    console.error("Error fetching college analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
      error: error.message
    });
  }
};

export { 
  collegeSignup, 
  collegeLogin, 
  getCollegeStudents, 
  getStudentDetails, 
  postOnCampusOpportunity, 
  getCollegeOpportunities, 
  updateCollegeProfile, 
  getCollegeAnalytics 
};
