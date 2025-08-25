import { Job } from "../models/job.model.js";
import Recruiter from "../models/recruiter.model.js"; 


const recruiterSignup = async (req, res) => {
    const { uid, email } = req.user; 
    const { companyName, contactName } = req.body;

    try {
        
        const existingRecruiter = await Recruiter.findOne({ firebaseid: uid });
        if (existingRecruiter) {
            return res.status(400).json({ message: "Recruiter already exists" });
        }

        
        const newRecruiter = await Recruiter.create({
            firebaseid: uid,
            email,
            profile: {
                companyName,
                contactName
            }
        });

        return res.status(201).json({ message: "Recruiter created successfully", user: newRecruiter });
    } catch (error) {
        console.error("Error during recruiter signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


const recruiterLogin = async (req, res) => {
    const { uid } = req.user;

    try {
        const recruiter = await Recruiter.findOne({ firebaseid: uid });
        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found" });
        }

        return res.status(200).json({ message: "Login successful", user: recruiter });
    } catch (error) {
        console.error("Error during recruiter login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
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
      recruiter: uid,
    });

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
export { recruiterSignup, recruiterLogin };