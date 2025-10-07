import express from "express";
import Job from "../models/job.model.js";
import { Recruiter } from "../models/recruiter.model.js";

const router = express.Router();

// Create job(s)
router.post("/", async (req, res) => {
  try {
    console.log("Creating job with data:", req.body);

    let jobs;
    if (Array.isArray(req.body)) {
      jobs = await Job.insertMany(req.body);

      // Update recruiter activity for each job
      for (const job of jobs) {
        if (job.recruiter) {
          await updateRecruiterActivity(job.recruiter, job._id);
        }
      }
    } else {
      jobs = await Job.create(req.body);

      // Update recruiter activity engagement
      if (jobs.recruiter) {
        await updateRecruiterActivity(jobs.recruiter, jobs._id);
      }
    }

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      data: jobs
    });
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to create job",
      error: err.message
    });
  }
});

// Helper function to update recruiter activity
async function updateRecruiterActivity(recruiterId, jobId) {
  try {
    await Recruiter.findByIdAndUpdate(
      recruiterId,
      {
        $inc: { 'activityEngagement.jobsPosted': 1 },
        $push: { 'activityEngagement.activeJobs': jobId }
      },
      { new: true }
    );
    console.log(`Updated recruiter ${recruiterId} activity for job ${jobId}`);
  } catch (error) {
    console.error(`Failed to update recruiter activity: ${error.message}`);
  }
}

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate({
        path: "recruiter",
        select: "name email designation company"
      })
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch jobs",
      error: err.message
    });
  }
});

// Get jobs by recruiter ID
router.get("/recruiter/:recruiterId", async (req, res) => {
  try {
    const { recruiterId } = req.params;
    console.log("Fetching jobs for recruiter:", recruiterId);

    const jobs = await Job.find({ recruiter: recruiterId })
      .populate({
        path: "recruiter",
        select: "name email designation company"
      })
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (err) {
    console.error("Error fetching jobs by recruiter:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch jobs",
      error: err.message
    });
  }
});

export default router;
