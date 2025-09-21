// src/controllers/student.controller.js
import { Student } from "../models/student.model.js";
import { studentRequiredSchema } from "../zodschemas/student.js";

import Job  from "../models/job.model.js";
import { Hackathon } from "../models/hackathon.model.js";
import {calculateSkillScore} from './applications.controller.js'

const signup = async (req, res) => {
  const { uid, email, name, picture } = req.user; // decoded from Firebase token

  try {
    if (!uid || !email) {
      return res.status(400).json({ message: "Missing Firebase user info" });
    }

    // If user already exists
    let user = await Student.findOne({ firebaseId: uid });
    if (user) {
      return res.status(200).json({ message: "User already exists", user });
    }

    // Extract extras from body
    const {
      phone,
      profile = {},
      education = {},
      job_preference = [],
      experience = [],
      projects = [],
      user_skills = {},
    } = req.body || {};

    // Try to validate minimal fields if schema exists (optional)
    let validated = null;
    try {
      if (studentRequiredSchema) {
        validated = studentRequiredSchema.parse({
          name: profile?.FullName || name || "",
          email,
          phone: phone || "",
          firebaseId: uid,
        });
      }
    } catch (zerr) {
      // If validation fails, log but continue building user object
      console.warn("studentRequiredSchema validation failed:", zerr?.message || zerr);
    }

    // Build user data (merge both variants safely)
    // const userData = {
    //   firebaseId: uid,
    //   email,
    //   phone: phone || "",
    //   studentId: req.body?.studentId || undefined,
    //   profile: {
    //     firstName: profile?.firstName || profile?.FullName || (name ? name.split(" ")[0] : "") || "",
    //     lastName:
    //       profile?.lastName ||
    //       (name && name.split(" ").length > 1 ? name.split(" ").slice(1).join(" ") : "") ||
    //       "",
    //     profilePicture: profile?.profilePicture || picture || "",
    //     bio: profile?.bio || "",
    //     dateOfBirth: profile?.dateOfBirth || undefined,
    //     gender: profile?.gender || undefined,
    //     location: profile?.location || undefined,
    //   },
    //   education: {
    //     college: education?.college || "",
    //     universityType: education?.universityType || "",
    //     degree: education?.degree || "",
    //     collegeEmail: education?.collegeEmail || "",
    //     branch: education?.branch || "",
    //     year: education?.year || undefined,
    //     cgpa: education?.cgpa || undefined,
    //     graduationYear: education?.graduationYear || undefined,
    //   },
    //   job_preference: Array.isArray(job_preference) ? job_preference : [],
    //   experience: Array.isArray(experience) ? experience : [],
    //   projects: Array.isArray(projects) ? projects : [],
    //   user_skills: user_skills || {},
    // };
    
    //changed userData according to the student model
    const userData = {
  studentId: req.body?.studentId,  // required
  firebaseId: uid,
  email,
  phone: phone || "",

  profile: {
    FullName:
      profile?.FullName ||
      (profile?.firstName || name ? name.split(" ")[0] : "") +
        " " +
        (profile?.lastName ||
          (name && name.split(" ").length > 1
            ? name.split(" ").slice(1).join(" ")
            : "")),
    profilePicture: profile?.profilePicture || picture || "",
    bio: profile?.bio || "",
  },

  education: {
    college: education?.college || "",
    universityType: education?.universityType || undefined, // must be "deemed" | "public" | "private"
    degree: education?.degree || "",
    collegeEmail: education?.collegeEmail || "",
  },

  user_skills: user_skills
    ? Object.entries(user_skills).reduce((acc, [skill, level]) => {
        acc[skill] = { level }; // ensure format { skill: { level: "beginner" | "mid" | "adv" } }
        return acc;
      }, {})
    : {},

  job_preference: Array.isArray(job_preference) ? job_preference : [],

  experience: Array.isArray(experience)
    ? experience.map((exp) => ({
        nameOfOrg: exp.nameOfOrg || exp.NameOfOrganization || "",
        position: exp.position || "",
        timeline: exp.timeline || "",
        description: exp.description || "",
      }))
    : [],

  projects: Array.isArray(projects)
    ? projects.map((proj) => ({
        projectName: proj.projectName || "",
        link: proj.link || "",
        description: proj.description || "",
      }))
    : [],
};

    // Create user
    user = await Student.create(userData);

    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Login — finds student by firebase UID
 */
const login = async (req, res) => {
  const { uid } = req.user || {};
  try {
    if (!uid) return res.status(400).json({ message: "Missing Firebase UID" });

    // Use consistent field name firebaseId
    const user = await Student.findOne({ firebaseId: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
/**
 * StudentDetails — sends student details for showing it in the profile or in edit features
 */
const getStudentDetails = async (req, res) => {
    const uid = req.user?.uid;

    if (!uid) return res.status(400).json({ message: "Missing Firebase UID" });

    try {
        const user = await Student.findOne({ firebaseId: uid });

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ message: "User fetched successfully", user });
    } catch (error) {
        console.error("Error fetching student details:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get hackathons
 */
const getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ startDate: 1 }).lean();
    return res.status(200).json({ hackathons });
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get jobs with filtering + pagination
 */
const getJobs = async (req, res) => {
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
      const skillArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      if (skillArray.length) filter["preferences.skills"] = { $in: skillArray };
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
        })
        .lean(),
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
};

/**
 * Apply to a job
 */
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user?._id || null;
    let student = null;

    if (studentId) {
      student = await Student.findById(studentId);
    } else if (req.user?.uid) {
      student = await Student.findOne({ firebaseId: req.user.uid });
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check existing application
    const existingApp = await Application.findOne({
      $or: [{ job: jobId, candidate: student._id }, { job: jobId, student: student._id }],
    });

    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // --- Calculate skill-based match score ---
    const matchScore = calculateSkillScore(job, student);

    // Create application with matchScore
    const newApplication = await Application.create({
      job: jobId,
      candidate: student._id, //  schema expects 'candidate'
      matchScore,
      status: "applied",
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error applying to job:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You’ve already applied to this job",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while applying to job",
      error: error.message,
    });
  }
};
// old one
// const applyToJob = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     // Prefer using user._id if auth middleware sets it; fall back to firebaseId lookup if not
//     const studentId = req.user?._id || null;
//     let student = null;

//     if (studentId) {
//       student = await Student.findById(studentId);
//     } else if (req.user?.uid) {
//       student = await Student.findOne({ firebaseId: req.user.uid });
//     }

//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const job = await Job.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     // Check existing application (some schemas use candidate, some student — check both)
//     const existingApp = await Application.findOne({
//       $or: [{ job: jobId, candidate: student._id }, { job: jobId, student: student._id }],
//     });

//     if (existingApp) {
//       return res.status(400).json({ message: "You have already applied for this job" });
//     }

//     const newApplication = await Application.create({
//       job: jobId,
//       // Use candidate if your Application schema expects that; if it expects `student`, consider adding student too
//       candidate: student._id,
//       student: student._id,
//       status: "applied",
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Application submitted successfully",
//       application: newApplication,
//     });
//   } catch (error) {
//     console.error("Error applying to job:", error);
//     //mongoDB error if student tries to apply twice for the same job post
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "You’ve already applied to this job",
//       });
//     }
//     return res.status(500).json({
//       success: false,
//       message: "Server error while applying to job",
//       error: error.message,
//     });
//   }
// };

/**
 * Update student profile (allows selective fields)
 */
const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return res.status(400).json({ message: "Missing student id" });

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
      "user_skills",
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      const parts = key.split(".");
      if (parts.length === 1) {
        if (req.body[parts[0]] !== undefined) updates[parts[0]] = req.body[parts[0]];
      } else {
        if (req.body[parts[0]] && req.body[parts[0]][parts[1]] !== undefined) {
          if (!updates[parts[0]]) updates[parts[0]] = {};
          updates[parts[0]][parts[1]] = req.body[parts[0]][parts[1]];
        }
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(studentId, { $set: updates }, { new: true, runValidators: true });
    if (!updatedStudent) return res.status(404).json({ message: "Student not found" });

    return res.status(200).json({ success: true, message: "Profile updated successfully", student: updatedStudent });
  } catch (error) {
    console.error("Error updating student profile:", error);
    return res.status(500).json({ success: false, message: "Server error while updating profile", error: error.message });
  }
};

/**
 * Upload profile photo (expects multer to populate req.file)
 */
const uploadProfilePhoto = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return res.status(400).json({ message: "Missing student id" });
    if (!req.file) return res.status(400).json({ success: false, message: "Please select a profile photo to upload", expectedField: "profilePhoto" });

    // Upload to Cloudinary (uploadOnCloudinary should return { success, url, public_id } or similar)
    const cloudinaryResult = await uploadOnCloudinary(req.file.path, {
      folder: "profile_photos",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
      tags: ["profile_photo", "student"],
    });

    if (!cloudinaryResult || !cloudinaryResult.url) {
      return res.status(500).json({ success: false, message: "Failed to upload profile photo", error: cloudinaryResult?.error || "Upload failed" });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: {
          "profile.profilePicture": cloudinaryResult.url,
          "profile.profilePicturePublicId": cloudinaryResult.public_id || cloudinaryResult.publicId || null,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) return res.status(404).json({ success: false, message: "Student profile not found" });

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully!",
      data: {
        profilePicture: cloudinaryResult.url,
        student: {
          id: updatedStudent._id,
          name: `${updatedStudent.profile?.firstName || ""} ${updatedStudent.profile?.lastName || ""}`.trim(),
          email: updatedStudent.email,
          profilePicture: updatedStudent.profile?.profilePicture,
        },
      },
    });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return res.status(500).json({ success: false, message: "Something went wrong while uploading your photo", error: error.message });
  }
};

// to add new skill to student's profile
const addSkill = async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(400).json({ message: "Missing Firebase UID" });

  const { skillName } = req.body;
  if (!skillName) return res.status(400).json({ message: "Skill name is required" });

  try {
    const user = await Student.findOne({ firebaseId: uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    // If the skill already exists, do nothing or return a message
    if (user.user_skills.has(skillName)) {
      return res.status(400).json({ message: "Skill already exists" });
    }

    // Add new skill with null level
    user.user_skills.set(skillName, { level: null });

    await user.save();

    return res.status(200).json({
      message: "Skill added successfully",
      skills: user.user_skills,
    });
  } catch (error) {
    console.error("Error adding skill:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifySkill = async (req, res) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(400).json({ message: "Missing Firebase UID" });

  const { skillName, level } = req.body;
  if (!skillName || !level) return res.status(400).json({ message: "Skill name and level are required" });

  const allowedLevels = ["beginner", "mid", "adv"];
  if (!allowedLevels.includes(level)) {
    return res.status(400).json({ message: "Invalid skill level" });
  }

  try {
    const user = await Student.findOne({ firebaseId: uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure the skill exists before verifying
    if (!user.user_skills.has(skillName)) {
      return res.status(400).json({ message: "Skill does not exist. Add it first." });
    }

    user.user_skills.set(skillName, { level });
    await user.save();

    return res.status(200).json({
      message: "Skill level updated successfully",
      skills: user.user_skills,
    });
  } catch (error) {
    console.error("Error updating skill level:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  signup,
  login,
  getJobs,
  getHackathons,
  applyToJob,
  updateStudentProfile,
  uploadProfilePhoto,
  getStudentDetails,
  addSkill,
  verifySkill,
  // getStudentAnalytic
};
