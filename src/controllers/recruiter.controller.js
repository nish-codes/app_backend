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
// Update Application Status
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const recruiterId = req.user._id;

    // Validate status
    const validStatuses = ["applied", "shortlisted", "rejected", "hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: applied, shortlisted, rejected, hired"
      });
    }

    // Find the application and verify the job belongs to this recruiter
    const application = await Application.findById(applicationId)
      .populate({
        path: "job",
        select: "recruiter title"
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Check if the job belongs to this recruiter
    if (application.job.recruiter.toString() !== recruiterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this application"
      });
    }

    // Update the application status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    ).populate({
      path: "candidate",
      select: "email profile.firstName profile.lastName"
    });

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: updatedApplication
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating application status",
      error: error.message
    });
  }
};

export { recruiterSignup, recruiterLogin, postJob, getApplications, updateApplicationStatus };
