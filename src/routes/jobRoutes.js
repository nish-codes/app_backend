import express from "express";
import Job from "../models/job.model.js";


const router = express.Router();

// Create job(s)
router.post("/", async (req, res) => {
  try {
    let jobs;

    // If you send an array → insertMany
    if (Array.isArray(req.body)) {
      jobs = await Job.insertMany(req.body);
    } else {
      // If you send single object → create
      jobs = await Job.create(req.body);
    }

    res.status(201).json(jobs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;