

// import { dummy} from "../models/dummy.model.js";
import { Student } from "../models/student.model.js";
import { studentRequiredSchema } from "../zodschemas/student.js";
import { Job } from "../models/job.model.js";
import { Hackathon } from "../models/hackathon.model.js";

const signup = async (req, res) => {
    const {uid,email} = req.user
    const {firstName, lastName} = req.body
    try{
        const user = await Student.findOne({firebaseid: uid});
        if(user) {
            return res.status(400).json({message: "User already exists"});
        }
        const newUser = await Student.create({
            firebaseid: uid,
            email,
        profile: {
            firstName,
            lastName
        }})

        return res.status(201).json({message: "User created successfully", user: newUser});
    

    }
    catch(error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const login = async (req, res) => {
    const {uid, email} = req.user
    try {
       const user = await Student.findOne({ firebaseid: uid });
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({message: "Login successful", user});

}
catch(error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const getHackathons = async (req, res) => {
    try{
        const hackathons = await Hackathon.find().sort({startDate: 1});
        return res.status(200).json({hackathons});
    }
    catch(error){

    }
}
const getJobs = async(req,res)=>{
    try {
        const { q, location, skills, page = "1", limit = "20", sort = "-createdAt" } = req.query;

        const filter = {};
        if (q && typeof q === "string" && q.trim().length) {
            filter.$text = { $search: q.trim() };
        }
        if (location && typeof location === "string" && location.trim().length) {
            filter["preferences.location"] = location.trim();
        }
        if (skills && typeof skills === "string" && skills.trim().length) {
            const skillArray = skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            if (skillArray.length) {
                filter["preferences.skills"] = { $in: skillArray };
            }
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const skip = (pageNum - 1) * limitNum;

        const [jobs, total] = await Promise.all([
            Job.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .populate({
                    path: "recruiter",
                    select: "name email designation companyId",
                    populate: {
                        path: "companyId",
                        model: "Company",
                        select: "name industry location logo",
                    },
                }),
            Job.countDocuments(filter),
        ]);

        return res.status(200).json({
            data: jobs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const applyToJob = async (req, res) => {
    try {
    const { jobId } = req.params;
    const studentId = req.user._id; 

    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    
    const existingApp = await Application.findOne({
      job: jobId,
      candidate: studentId,
    });
    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const newApplication = await Application.create({
      job: jobId,
      candidate: studentId,
      status: "applied",
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: newApplication,
    });

  } catch (error) {
    console.error("Error applying to job:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while applying to job",
      error: error.message,
    });
  }
}
const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user._id; // student comes from auth

    // Fields allowed to update
    const allowedUpdates = [
      "email",
      "phone",
      "profile.firstName",
      "profile.lastName",
      "profile.profilePicture",
      "profile.bio",
      "profile.dateOfBirth",
      "profile.gender",
      "profile.location.city",
      "profile.location.state",
      "profile.location.country",
      "profile.location.pincode",
      "education.college",
      "education.degree",
      "education.branch",
      "education.year",
      "education.cgpa",
      "education.graduationYear",
      "user_skills"
    ];

    // Build the updates object dynamically
    const updates = {};
    for (const key of allowedUpdates) {
      const parts = key.split("."); // handle nested fields
      if (parts.length === 1) {
        if (req.body[parts[0]] !== undefined) updates[parts[0]] = req.body[parts[0]];
      } else {
        // nested object
        if (req.body[parts[0]] && req.body[parts[0]][parts[1]] !== undefined) {
          if (!updates[parts[0]]) updates[parts[0]] = {};
          updates[parts[0]][parts[1]] = req.body[parts[0]][parts[1]];
        }
      }
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

export {signup, login, getJobs};

