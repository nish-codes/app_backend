import { Job } from "../models/job.model.js";
import { Recruiter } from "../models/recruiter.model.js";

// Recruiter signup
const recruiterSignup = async (req, res) => {
  const { uid, email } = req.user;
  const { name, phone, profilePicture, designation, companyId } = req.body;

  try {
    // check if recruiter already exists
    const existingRecruiter = await Recruiter.findOne({ firebaseId: uid });
    if (existingRecruiter) {
      return res.status(400).json({ message: "Recruiter already exists" });
    }

    // create new recruiter
    const newRecruiter = await Recruiter.create({
      firebaseId: uid,
      email,
      name,
      phone,
      profilePicture,
      designation,
      companyId,
    });

    return res.status(201).json({
      message: "Recruiter created successfully",
      user: newRecruiter,
    });
  } catch (error) {
    console.error("Error during recruiter signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Recruiter login
const recruiterLogin = async (req, res) => {
  const { uid } = req.user;

  try {
    const recruiter = await Recruiter.findOne({ firebaseId: uid });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: recruiter,
    });
  } catch (error) {
    console.error("Error during recruiter login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Recruiter posting a job
const postJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, jobType } = req.body;
    const { uid } = req.user;

    if (!title || !description || !company || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description, company, and location",
      });
    }

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      jobType,
      recruiter: uid, // link recruiter
    });

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error while posting job:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { recruiterSignup, recruiterLogin, postJob };
