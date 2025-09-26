// src/controllers/student.controller.js
import { Student } from "../models/student.model.js";
import { studentRequiredSchema } from "../zodschemas/student.js";
import Job from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Hackathon } from "../models/hackathon.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  const { uid, email, name, picture } = req.user || {};
  try {
    if (!uid || !email) {
      return res.status(400).json({ message: "Missing Firebase user info" });
    }

    // If user already exists
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
    } = req.body || {};

    console.log("📝 Request body received:", JSON.stringify(req.body, null, 2));
    console.log("👤 Firebase user data:", { uid, email, name, picture });

    // Build user data with proper field mapping
    const userData = {
      firebaseId: uid,
      email,
      phone: phone || "",
      
      profile: {
        // ✅ FIX: Map firstName + lastName to FullName (required by schema)
        FullName: profile?.FullName || 
                 (profile?.firstName && profile?.lastName 
                   ? `${profile.firstName} ${profile.lastName}`
                   : profile?.firstName || name || "Unknown User"),
        
        profilePicture: profile?.profilePicture || picture || "",
        bio: profile?.bio || "",
      },

      education: {
        college: education?.college || "",
        
        // ✅ FIX: Map to correct enum values ["deemed","public","private"]
        universityType: education?.universityType || 
                       education?.university || 
                       "public", // Default fallback to valid enum value
        
        degree: education?.degree || "",
        collegeEmail: education?.collegeEmail || education?.collegeEmailId || "",
      },

      // ✅ FIX: Ensure job_preference is not empty (required in schema)
      job_preference: Array.isArray(job_preference) && job_preference.length > 0 
                     ? job_preference 
                     : ["Software Development"], // Default value

      experience: Array.isArray(experience) ? experience : [],
      projects: Array.isArray(projects) ? projects : [],
      user_skills: user_skills || {},
    };

    console.log("💾 User data to be saved:", JSON.stringify(userData, null, 2));

    // Create user
    user = await Student.create(userData);
    console.log("✅ User created successfully:", user._id);

    return res.status(201).json({ 
      message: "User created successfully", 
      user,
      exists: true 
    });

  } catch (error) {
    console.error("❌ Error during signup:", error);
    
    // Provide more detailed error information
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors,
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
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
    // Prefer using user._id if auth middleware sets it; fall back to firebaseId lookup if not
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

    // Check existing application (some schemas use candidate, some student — check both)
    const existingApp = await Application.findOne({
      $or: [{ job: jobId, candidate: student._id }, { job: jobId, student: student._id }],
    });

    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const newApplication = await Application.create({
      job: jobId,
      // Use candidate if your Application schema expects that; if it expects `student`, consider adding student too
      candidate: student._id,
      student: student._id,
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
};

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

export { signup, login, getJobs, checkUser, getHackathons, applyToJob, updateStudentProfile, uploadProfilePhoto };
