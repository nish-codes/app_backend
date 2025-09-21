import { Student } from "../models/student.model.js";
import { studentRequiredSchema } from "../zodschemas/student.js";
import Job from "../models/job.model.js";
import { Application } from "../models/application.model.js";

const signup = async (req, res) => {
  const { uid, email, name, picture } = req.user; // decoded from Firebase token

  try {
    // 1️⃣ Check if user exists
    let user = await Student.findOne({ firebaseId: uid });
    if (user) {
      return res.status(200).json({
        message: "User already exists",
        user,
      });
    }

    // 2️⃣ Extract additional data from request body
    const { phone, profile, education } = req.body;

    // 3️⃣ Generate unique studentId
    const count = await Student.countDocuments();
    // Pad numbers below 10000, otherwise just use the number
    const paddedNumber = count + 1 < 10000 
      ? String(count + 1).padStart(4, "0") 
      : String(count + 1);
    const studentId = `STU${paddedNumber}`;

    // 4️⃣ Prepare user data
    const userData = {
      studentId,
      firebaseId: uid,
      email,
      profile: {
        firstName: profile?.firstName || name?.split(" ")[0] || "",
        lastName:
          profile?.lastName ||
          (name?.split(" ").length > 1
            ? name?.split(" ").slice(1).join(" ")
            : ""),
        profilePicture: profile?.profilePicture || picture || "",
        ...(profile?.bio && { bio: profile.bio }),
        ...(profile?.dateOfBirth && { dateOfBirth: profile.dateOfBirth }),
        ...(profile?.gender && { gender: profile.gender }),
        ...(profile?.location && { location: profile.location }),
      },
    };

    // 5️⃣ Add phone if provided
    if (phone) {
      userData.phone = phone;
    }

    // 6️⃣ Add education data if provided
    if (education) {
      userData.education = {
        ...(education.college && { college: education.college }),
        ...(education.degree && { degree: education.degree }),
        ...(education.branch && { branch: education.branch }),
        ...(education.year && { year: education.year }),
        ...(education.cgpa && { cgpa: education.cgpa }),
        ...(education.graduationYear && { graduationYear: education.graduationYear }),
      };
    }

    // 7️⃣ Create new user
    user = await Student.create(userData);

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

export default signup;


// ✅ Fixed checkUser function with enhanced debugging
const checkUser = async (req, res) => {
  console.log("🔍 checkUser endpoint hit!");
  console.log("📋 Request headers:", req.headers);
  console.log("🔑 Request user:", req.user);
  
  const { uid } = req.user; // from Firebase token
  
  try {
    console.log("🔍 Checking user with UID:", uid);
    
    // Just check if user exists in database - FIXED: firebaseId not firebaseid
    const user = await Student.findOne({ firebaseId: uid });
    
    if (user) {
      console.log("✅ User found in database!");
      console.log("👤 User ID:", user._id);
      console.log("👤 User email:", user.email);
      
      // User exists - send to homepage
      return res.status(200).json({
        exists: true,
        user
      });
    } else {
      console.log("❌ User not found in database");
      
      // Let's also check what users exist
      const allUsers = await Student.find({}, 'firebaseId email').limit(5);
      console.log("📋 Sample users in database:", allUsers);
      
      // User doesn't exist - send to register
      return res.status(404).json({
        exists: false,
        message: "User not found"
      });
    }
  } catch (error) {
    console.error("❌ Error checking user:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// ✅ Fixed login function - corrected field name
const login = async (req, res) => {
    const { uid, email } = req.user;
    try {
       // FIXED: firebaseId not firebaseid
       const user = await Student.findOne({ firebaseId: uid });
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
        console.error("Error fetching hackathons:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getJobs = async(req,res)=>{
    try {
        const { q, location, skills, page = "1", limit = "20", sort = "-createdAt" } = req.query;

        const filter = {};
        if (q && typeof q === "string" && q.trim().length) {
            filter.$text = { $search: q.trim() };
        }getJobs
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
    const firebaseUid = req.user.uid;
    
    // Change this line:
    const student = await Student.findOne({ firebaseId: firebaseUid });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    const existingApp = await Application.findOne({
      job: jobId,
      candidate: student._id, // Use the actual MongoDB _id
    });
    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }
    
    const newApplication = await Application.create({
      job: jobId,
      candidate: student._id, // Use the actual MongoDB _id
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

export { signup, login, getJobs, checkUser, getHackathons, applyToJob, updateStudentProfile };