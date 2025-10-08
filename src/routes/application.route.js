import express from "express";
import { Application } from "../models/application.model.js";
import { Recruiter } from "../models/recruiter.model.js";

const router = express.Router();

// Get all applications for a specific recruiter
router.get("/recruiter/:recruiterId", async (req, res) => {
    try {
        const { recruiterId } = req.params;
        console.log("Fetching applications for recruiter:", recruiterId);

        // Find all jobs posted by this recruiter
        const recruiter = await Recruiter.findById(recruiterId);
        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found"
            });
        }

        const jobIds = recruiter.activityEngagement?.activeJobs || [];

        const applications = await Application.find({ job: { $in: jobIds } })
            .populate({
                path: "job",
                select: "title description mode preferences salaryRange createdAt"
            })
            .populate({
                path: "candidate",
                select: "name email phone profile user_skills experience"
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: applications,
            count: applications.length
        });
    } catch (err) {
        console.error("Error fetching applications by recruiter:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch applications",
            error: err.message
        });
    }
});

// Get applications for a specific job
router.get("/job/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;
        console.log("Fetching applications for job:", jobId);

        const applications = await Application.find({ job: jobId })
            .populate({
                path: "job",
                select: "title description mode preferences salaryRange"
            })
            .populate({
                path: "candidate",
                select: "name email phone profile user_skills experience"
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: applications,
            count: applications.length
        });
    } catch (err) {
        console.error("Error fetching applications by job:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch applications",
            error: err.message
        });
    }
});

// Update application status
router.patch("/:applicationId/status", async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        if (!["applied", "shortlisted", "rejected", "hired"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: applied, shortlisted, rejected, hired"
            });
        }

        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        ).populate([
            { path: "job", select: "title" },
            { path: "candidate", select: "name email" }
        ]);

        if (!updatedApplication) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        res.json({
            success: true,
            message: "Application status updated successfully",
            data: updatedApplication
        });
    } catch (err) {
        console.error("Error updating application status:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to update application status",
            error: err.message
        });
    }
});

// Create a new application (for testing)
router.post("/", async (req, res) => {
    try {
        const { job, candidate, status = "applied", matchScore = 0 } = req.body;

        const newApplication = new Application({
            job,
            candidate,
            status,
            matchScore
        });

        const savedApplication = await newApplication.save();

        const populatedApplication = await Application.findById(savedApplication._id)
            .populate({
                path: "job",
                select: "title description mode preferences salaryRange"
            })
            .populate({
                path: "candidate",
                select: "name email phone profile user_skills"
            });

        res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: populatedApplication
        });
    } catch (err) {
        console.error("Error creating application:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to create application",
            error: err.message
        });
    }
});

// Get all applications (for debugging)
router.get("/", async (req, res) => {
    try {
        const applications = await Application.find()
            .populate({
                path: "job",
                select: "title description mode preferences salaryRange"
            })
            .populate({
                path: "candidate",
                select: "name email phone profile user_skills"
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: applications,
            count: applications.length
        });
    } catch (err) {
        console.error("Error fetching all applications:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch applications",
            error: err.message
        });
    }
});

export default router;