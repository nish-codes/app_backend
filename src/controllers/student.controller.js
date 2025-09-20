// import { dummy} from "../models/dummy.model.js";
import { Student } from "../models/student.model.js";
import { studentRequiredSchema } from "../zodschemas/student.js";
// <<<<<<< HEAD
// import Job from "../models/job.model.js";

import Job from "../models/job.model.js";
// import { Job } from "../models/job.model.js";
import { Hackathon } from "../models/hackathon.model.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";


export const checkUser = async (req, res) => {
  try {
    const uid = req.user.uid;
    const user = await Student.findOne({ firebaseId: uid });

    if (user) {
      return res.status(200).json({ exists: true, user });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
  
/**
 * Signup a first-time user
 * - Firebase info (uid, email, name, picture) comes from the verified token
 * - Extra info (FullName, profilePicture, bio, education, skills, etc.) comes from the frontend form
 */
const signup = async (req, res) => {
  const { uid, email, name, picture } = req.user; // decoded from Firebase token

  try {
    // 1️⃣ Check if user already exists
    let user = await Student.findOne({ firebaseId: uid });
    if (user) {
      return res.status(200).json({
        message: "User already exists",
        user,
      });
    }

    // 2️⃣ Extract additional data from request body (form inputs)
    const { phone, profile, education, job_preference, experience, projects, user_skills } = req.body;

    // 3️⃣ Merge Firebase data + form data
    const userData = {
      firebaseId: uid,         // from Firebase token
      email,                   // from Firebase token
      profile: {
        FullName: profile?.FullName || name || "",           // form input or Google name
        profilePicture: profile?.profilePicture || picture || "", // form input or Google picture
        bio: profile?.bio || "",                             // from form
      },
      phone: phone || "",                                    // from form
      education: {
        college: education?.college || "",
        universityType: education?.universityType || "",
        degree: education?.degree || "",
        collegeEmail: education?.collegeEmail || "",
      },
      job_preference: job_preference || [],   // array of strings from form
      experience: experience || [],           // array of objects from form
      projects: projects || [],               // array of objects from form
      user_skills: user_skills || {},         // Map of skills from form
    };

    // 4️⃣ Create new student document in MongoDB
    user = await Student.create(userData);

    // 5️⃣ Respond with newly created user
    return res.status(201).json({
      message: "User created successfully",
      user,
    });

  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};



const login = async (req, res) => {
  const { uid, email } = req.user
  try {
    const user = await Student.findOne({ firebaseid: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Login successful", user });

  }
  catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
const getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ startDate: 1 });
    return res.status(200).json({ hackathons });
  }
  catch (error) {

  }
}
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

const uploadProfilePhoto = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a profile photo to upload',
        expectedField: 'profilePhoto'
      });
    }

    console.log(`Uploading profile photo for student: ${studentId}`);

    // Upload to Cloudinary with profile photo settings
    const cloudinaryResult = await uploadOnCloudinary(req.file.path, {
      folder: 'profile_photos',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      tags: ['profile_photo', 'student']
    });

    if (!cloudinaryResult || !cloudinaryResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload your profile photo. Please try again.',
        error: cloudinaryResult?.error || 'Upload service error'
      });
    }

    // Update student profile with new photo
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: {
          "profile.profilePicture": cloudinaryResult.url,
          "profile.profilePicturePublicId": cloudinaryResult.public_id,
          "updatedAt": new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    console.log(`Profile photo updated successfully for student: ${studentId}`);

    return res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully!',
      data: {
        profilePicture: cloudinaryResult.url,
        student: {
          id: updatedStudent._id,
          name: `${updatedStudent.profile?.firstName || ''} ${updatedStudent.profile?.lastName || ''}`.trim(),
          email: updatedStudent.email,
          profilePicture: updatedStudent.profile?.profilePicture
        }
      }
    });

  } catch (error) {
    console.error("Error uploading profile photo:", error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while uploading your photo. Please try again.',
      error: error.message
    });
  }
};

export { signup, login, getJobs, uploadProfilePhoto };

