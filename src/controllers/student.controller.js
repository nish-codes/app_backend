// src/controllers/student.controller.js
import { Student } from "../models/student.model.js";
import { studentRequiredSchema } from "../zodschemas/student.js";
import { Application } from "../models/application.model.js";
import Job  from "../models/job.model.js";
import { Hackathon } from "../models/hackathon.model.js";
import {calculateSkillScore} from './applications.controller.js'


/**
 * Check if a user exists by firebase UID
 */
const checkUser = async (req, res) => {
  try {
    const uid = req.user?.uid;
    console.log("🔍 Checking user with UID:", uid);
    
    if (!uid) {
      console.log("❌ Missing user UID");
      return res.status(400).json({ message: "Missing user UID" });
    }

    const user = await Student.findOne({ firebaseId: uid });
    console.log("🔍 Database query result:", user ? "Found" : "Not found");

    if (user) {
      console.log("✅ User exists in database");
      return res.status(200).json({ exists: true, user });
    } else {
      console.log("👤 User not found in database");
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("❌ Error checking user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Signup a first-time user
 * - Firebase info (uid, email, name, picture) comes from the verified token
 * - Extra info comes from frontend form
 */

 const signup = async (req, res) => {
  const { uid, email, name, picture } = req.user; // decoded from Firebase token

  try {
    if (!uid || !email) {
      return res.status(400).json({ message: "Missing Firebase user info" });
    }

    // Check if user already exists
    let user = await Student.findOne({ firebaseId: uid });
    if (user) {
      return res.status(200).json({ message: "User already exists", user });
    }

    // Extract data from request body
    const {
      phone,
      profile = {},
      education = {},
      job_preference = [],
      experience = [],
      projects = [],
      user_skills = {},
      studentId
    } = req.body || {};

    console.log("📝 Request body received:", JSON.stringify(req.body, null, 2));
    console.log("👤 Firebase user data:", { uid, email, name, picture });

    // Build user data according to schema
    const userData = {
      studentId: studentId || undefined,
      firebaseId: uid,
      email,
      phone: phone || "",

      profile: {
        FullName:
          profile?.FullName ||
          ((profile?.firstName || name ? name.split(" ")[0] : "") +
            " " +
            (profile?.lastName ||
              (name && name.split(" ").length > 1
                ? name.split(" ").slice(1).join(" ")
                : ""))),
        profilePicture: profile?.profilePicture || picture || "",
        bio: profile?.bio || "",
      },

      education: {
        college: education?.college || "",
        universityType: education?.universityType || undefined,
        degree: education?.degree || "",
        collegeEmail: education?.collegeEmail || "",
        yearOfPassing: education?.yearOfPassing || null,
      },

      // ✅ FIXED user_skills
      user_skills: user_skills
        ? Object.entries(user_skills).reduce((acc, [skill, skillData]) => {
            const levelValue =
              typeof skillData === "string" ? skillData : skillData.level;
            acc[skill] = { level: levelValue };
            return acc;
          }, {})
        : {},

      job_preference:
        Array.isArray(job_preference) && job_preference.length > 0
          ? job_preference
          : ["Software Development"],

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

    console.log("💾 User data to be saved:", JSON.stringify(userData, null, 2));

    // Create user in database
    user = await Student.create(userData);
    console.log("✅ User created successfully:", user._id);

    return res.status(201).json({
      message: "User created successfully",
      user,
      exists: true,
    });
  } catch (error) {
    console.error("❌ Error during signup:", error);

    if (error.name === "ValidationError") {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
        details: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
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
      $or: [
        { job: jobId, candidate: student._id },
        { job: jobId, student: student._id }
      ],
    });

    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // --- Calculate skill-based match score ---
    const matchScore = calculateSkillScore(job, student);

    // Create application with matchScore
    const newApplication = await Application.create({
      job: jobId,
      candidate: student._id, // schema expects 'candidate'
      matchScore,
      status: "applied",
    });

    // ✅ Add job to student.saves (like swipe save)
    await Student.findByIdAndUpdate(
      student._id,
      { $addToSet: { saves: jobId } }, // prevents duplicates
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully & job saved",
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

/**
 * Get applications count summary for the authenticated student
 * - returns counts for applied, shortlisted, rejected, hired
 */
const getApplicationCounts = async (req, res) => {
  try {
    // Use internal _id if middleware set it, else resolve via firebase uid
    let studentId = req.user?._id || null;
    if (!studentId) {
      const uid = req.user?.uid;
      if (!uid) return res.status(400).json({ message: "Missing Firebase UID" });
      const student = await Student.findOne({ firebaseId: uid }).select("_id");
      if (!student) return res.status(404).json({ message: "Student not found" });
      studentId = student._id;
    }

    const [applied, shortlisted, rejected, hired, total] = await Promise.all([
      Application.countDocuments({ candidate: studentId, status: "applied" }),
      Application.countDocuments({ candidate: studentId, status: "shortlisted" }),
      Application.countDocuments({ candidate: studentId, status: "rejected" }),
      Application.countDocuments({ candidate: studentId, status: "hired" }),
      Application.countDocuments({ candidate: studentId }),
    ]);

    return res.status(200).json({
      success: true,
      data: { total, applied, shortlisted, rejected, hired },
    });
  } catch (error) {
    console.error("Error getting application counts:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get count of applications with status=applied for the authenticated student
 */
const getAppliedApplicationsCount = async (req, res) => {
  try {
    let studentId = req.user?._id || null;
    if (!studentId) {
      const uid = req.user?.uid;
      if (!uid) return res.status(400).json({ message: "Missing Firebase UID" });
      const student = await Student.findOne({ firebaseId: uid }).select("_id");
      if (!student) return res.status(404).json({ message: "Student not found" });
      studentId = student._id;
    }

    const count = await Application.countDocuments({ candidate: studentId, status: "applied" });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error getting applied applications count:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get count of applications with status=shortlisted for the authenticated student
 */
const getShortlistedApplicationsCount = async (req, res) => {
  try {
    let studentId = req.user?._id || null;
    if (!studentId) {
      const uid = req.user?.uid;
      if (!uid) return res.status(400).json({ message: "Missing Firebase UID" });
      const student = await Student.findOne({ firebaseId: uid }).select("_id");
      if (!student) return res.status(404).json({ message: "Student not found" });
      studentId = student._id;
    }

    const count = await Application.countDocuments({ candidate: studentId, status: "shortlisted" });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error getting shortlisted applications count:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get applications list for the authenticated student with optional filters
 * Query params:
 * - status: applied | shortlisted | rejected | hired (optional)
 * - page: number (default 1)
 * - limit: number (default 20)
 * - sort: default -createdAt
 */
const getApplications = async (req, res) => {
  try {
    // Resolve student id
    let studentId = req.user?._id || null;
    if (!studentId) {
      const uid = req.user?.uid;
      if (!uid) return res.status(400).json({ message: "Missing Firebase UID" });
      const student = await Student.findOne({ firebaseId: uid }).select("_id");
      if (!student) return res.status(404).json({ message: "Student not found" });
      studentId = student._id;
    }

    const { status, page = "1", limit = "20", sort = "-createdAt" } = req.query;

    const filter = { candidate: studentId };
    if (status && ["applied", "shortlisted", "rejected", "hired"].includes(status)) {
      filter.status = status;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: "job",
          select: "title preferences location createdAt recruiter",
          populate: {
            path: "recruiter",
            select: "name email designation companyId",
            populate: {
              path: "companyId",
              model: "Company",
              select: "name industry location logo",
            },
          },
        })
        .lean(),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error getting applications:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Analytics for the authenticated student
 * - totals by status
 * - monthly trend (last 6 months) grouped by status
 * - conversion rates
 * - recent applications
 */
const getStudentAnalytics = async (req, res) => {
  try {
    // Resolve student id
    let studentId = req.user?._id || null;
    if (!studentId) {
      const uid = req.user?.uid;
      if (!uid) return res.status(400).json({ message: "Missing Firebase UID" });
      const student = await Student.findOne({ firebaseId: uid }).select("_id");
      if (!student) return res.status(404).json({ message: "Student not found" });
      studentId = student._id;
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Totals by status and overall
    const [total, applied, shortlisted, rejected, hired] = await Promise.all([
      Application.countDocuments({ candidate: studentId }),
      Application.countDocuments({ candidate: studentId, status: "applied" }),
      Application.countDocuments({ candidate: studentId, status: "shortlisted" }),
      Application.countDocuments({ candidate: studentId, status: "rejected" }),
      Application.countDocuments({ candidate: studentId, status: "hired" }),
    ]);

    // Monthly trend for last 6 months
    const trendRaw = await Application.aggregate([
      { $match: { candidate: studentId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Normalize trend into a map of months
    const formatMonthKey = (y, m) => `${y}-${String(m).padStart(2, "0")}`;
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(formatMonthKey(d.getFullYear(), d.getMonth() + 1));
    }
    const statuses = ["applied", "shortlisted", "rejected", "hired"];
    const trend = months.map((monthKey) => {
      const entry = { month: monthKey };
      statuses.forEach((s) => (entry[s] = 0));
      return entry;
    });
    trendRaw.forEach((row) => {
      const key = formatMonthKey(row._id.year, row._id.month);
      const target = trend.find((t) => t.month === key);
      if (target) target[row._id.status] = row.count;
    });

    const conversion = {
      shortlistRate: applied > 0 ? Number(((shortlisted / applied) * 100).toFixed(2)) : 0,
      hireRate: applied > 0 ? Number(((hired / applied) * 100).toFixed(2)) : 0,
      rejectionRate: applied > 0 ? Number(((rejected / applied) * 100).toFixed(2)) : 0,
    };

    const recentApplications = await Application.find({ candidate: studentId })
      .sort("-createdAt")
      .limit(10)
      .populate({
        path: "job",
        select: "title preferences location createdAt recruiter",
        populate: {
          path: "recruiter",
          select: "name email designation companyId",
          populate: {
            path: "companyId",
            model: "Company",
            select: "name industry location logo",
          },
        },
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        totals: { total, applied, shortlisted, rejected, hired },
        conversion,
        trend,
        recentApplications,
      },
    });
  } catch (error) {
    console.error("Error getting student analytics:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  signup,
  checkUser,
  login,
  getJobs,
  getHackathons,
  applyToJob,
  updateStudentProfile,
  uploadProfilePhoto,
  getStudentDetails,
  addSkill,
  verifySkill,
  getApplicationCounts,
  getAppliedApplicationsCount,
  getShortlistedApplicationsCount,
  getApplications,
  getStudentAnalytics,
  // getStudentAnalytic
};
