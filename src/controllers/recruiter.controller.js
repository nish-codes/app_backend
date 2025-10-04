import { Application } from "../models/application.model.js";
import  Job  from "../models/job.model.js";
import { Recruiter } from "../models/recruiter.model.js"; 
import { Student } from "../models/student.model.js";

// Recruiter Signup
const recruiterSignup = async (req, res) => {
  const { uid, email } = req.user;
  const { 
    name, 
    phone, 
    designation, 
    company 
  } = req.body;

  try {
    const existingRecruiter = await Recruiter.findOne({ firebaseId: uid });
    if (existingRecruiter) {
      return res.status(400).json({ message: "Recruiter already exists" });
    }

    // Validate company details are provided
    if (!company || !company.name) {
      return res.status(400).json({ message: "Company details are required" });
    }

    const newRecruiter = await Recruiter.create({
      firebaseId: uid,
      email,
      name,
      phone,
      designation,
      company: {
        name: company.name,
        description: company.description || "",
        industry: company.industry || "",
        website: company.website || "",
        location: company.location || {},
        size: company.size || "",
        companyType: company.companyType || "Startup",
        founded: company.founded || null,
        logo: company.logo || "",
      },
    });

    return res
      .status(201)
      .json({ 
        message: "Recruiter created successfully", 
        user: newRecruiter 
      });
  } catch (error) {
    console.error("Error during recruiter signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Recruiter Login
const recruiterLogin = async (req, res) => {
  const { uid } = req.user;

  try {
    const recruiter = await Recruiter.findOne({ firebaseId: uid });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    return res.status(200).json({ message: "Login successful", user: recruiter });
  } catch (error) {
    console.error("Error during recruiter login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Post Job
const postJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      rolesAndResponsibilities,
      perks,
      details,
      salaryRange, 
      recruiter,   // directly from body
      preferences, 
      jobType, 
      employmentType,
      noOfOpenings,
      duration,
      mode,
      stipend,
      college, 
      applicationLink 
    } = req.body;

    // Validate required fields
    if (!title || !description || !salaryRange?.min || !salaryRange?.max) {
      return res.status(400).json({ 
        message: "Title, description, and salary range are required" 
      });
    }

    // Validate jobType
    if (!jobType || !["company", "on-campus", "external"].includes(jobType)) {
      return res.status(400).json({ 
        message: "Valid jobType is required (company, on-campus, or external)" 
      });
    }

    // Validate employmentType
    if (!employmentType || !["full-time", "part-time", "contract", "internship", "freelance"].includes(employmentType)) {
      return res.status(400).json({ 
        message: "Valid employmentType is required (full-time, part-time, contract, internship, freelance)" 
      });
    }

    // Validate mode
    if (!mode || !["remote", "on-site", "hybrid"].includes(mode)) {
      return res.status(400).json({ 
        message: "Valid mode is required (remote, on-site, hybrid)" 
      });
    }

    let jobData = { 
      title, 
      description, 
      rolesAndResponsibilities,
      perks,
      details,
      salaryRange, 
      preferences: preferences || {}, 
      jobType,
      employmentType,
      noOfOpenings: noOfOpenings || 1,
      duration,
      mode,
      stipend
    };

    if (jobType === "on-campus") {
      if (!college || !applicationLink) {
        return res.status(400).json({ 
          message: "College and application link are required for on-campus jobs" 
        });
      }
      jobData.college = college;
      jobData.applicationLink = applicationLink;
    } else {
      if (!recruiter) {
        return res.status(400).json({ 
          message: "Recruiter is required for company/external jobs" 
        });
      }
      jobData.recruiter = recruiter;
    }

    // Create job
    const newJob = await Job.create(jobData);

    // Update recruiter stats only for company/external jobs
    if (jobType !== "on-campus") {
      await Recruiter.findByIdAndUpdate(recruiter, {
        $inc: { "activityEngagement.jobsPosted": 1 },
        $push: { "activityEngagement.activeJobs": newJob._id },
      });
    }

    // Populate recruiter for company/external jobs
    let populatedJob;
    if (jobType === "on-campus") {
      populatedJob = await Job.findById(newJob._id);
    } else {
      populatedJob = await Job.findById(newJob._id)
        .populate("recruiter", "name email designation company");
    }

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job: populatedJob,
    });

  } catch (error) {
    console.error("Error posting job:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};



// Get Applications for a Job
// const getApplications = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const recruiterId = req.user._id;

//     const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
//     if (!job) {
//       return res
//         .status(404)
//         .json({ message: "Job not found or not owned by recruiter" });
//     }

//     const applications = await Application.find({ job: jobId })
//       .populate({
//         path: "candidate",
//         select:
//           "email profile.firstName profile.lastName education user_skills",
//       })
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       jobId,
//       applications,
//     });
//   } catch (error) {
//     console.error("Error fetching applications:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching applications",
//       error: error.message,
//     });
//   }
// };

const getUserSkillsArray = (userSkills) => {
  if (!userSkills) return [];
  if (userSkills instanceof Map) return Array.from(userSkills.keys());
  if (typeof userSkills === "object" && userSkills !== null) return Object.keys(userSkills);
  return [];
};


const getApplications = async (req, res) => {
  try {
    console.log("🔍 Auth Debug - req.user:", req.user);
    
    // 1️⃣ Find current student - try both _id and firebaseId
    let student;
    
    if (req.user._id) {
      student = await Student.findById(req.user._id).select("education.college user_skills");
    }
    
    if (!student && req.user.uid) {
      student = await Student.findOne({ firebaseId: req.user.uid }).select("education.college user_skills");
    }
    
    if (!student && req.user._id) {
      student = await Student.findOne({ firebaseId: req.user._id }).select("education.college user_skills");
    }
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found. Please complete your profile setup.",
        debug: {
          userId: req.user._id,
          firebaseUid: req.user.uid
        }
      });
    }

    console.log("👤 Student found:", student.profile?.FullName || "Unknown");
    console.log("🎓 Student college:", student.education?.college || "None");
    console.log("🛠️ Raw user_skills:", student.user_skills);

    const userSkillsArray = getUserSkillsArray(student.user_skills);
    const hasUserSkills = userSkillsArray.length > 0;

    console.log("🛠️ User skills array:", userSkillsArray);
    console.log("✅ Has user skills:", hasUserSkills);

    let opportunities = [];
    let searchStrategy = "";
    
    // 2️⃣ Priority 1: Skills-based company jobs
    if (hasUserSkills) {
      console.log("🎯 Searching for skills-based jobs...");
      
// Escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const companyJobs = await Job.find({
  jobType: "company",
  "preferences.skills": {
    $in: userSkillsArray.map((skill) => 
      new RegExp(`^${escapeRegex(skill)}$`, "i")
    ),
  },
})
.populate({
  path: "recruiter",
  select: "name email designation company"
})
.sort({ createdAt: -1 });

      console.log("💼 Skills-based jobs found:", companyJobs.length);

      if (companyJobs.length > 0) {
        const skillMatchedJobs = companyJobs.map((job) => {
          const matchingSkills = job.preferences.skills.filter((jobSkill) =>
            userSkillsArray.some(
              (userSkill) => userSkill.toLowerCase().trim() === jobSkill.toLowerCase().trim()
            )
          );
          return {
            ...job.toObject(),
            matchingSkills,
            matchingSkillsCount: matchingSkills.length,
            priority: "skills-based"
          };
        });

        // Sort by match count, then recency
        skillMatchedJobs.sort((a, b) => {
          if (b.matchingSkillsCount !== a.matchingSkillsCount) {
            return b.matchingSkillsCount - a.matchingSkillsCount;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        opportunities = [...opportunities, ...skillMatchedJobs];
      }
    }
    
    // 3️⃣ Priority 2: General company jobs (fallback)
    if (opportunities.length === 0 || !hasUserSkills) {
      console.log("📋 Fetching general company jobs...");
      
      const generalJobs = await Job.find({ jobType: "company" })
        .populate({
          path: "recruiter",
          select: "name email designation company",
          populate: {
            path: "company",
            select: "name description industry website location size companyType founded logo"
          }
        })
        .sort({ createdAt: -1 })
        .limit(10);

      console.log("📋 General jobs found:", generalJobs.length);

      const generalJobsWithPriority = generalJobs.map(job => ({
        ...job.toObject(),
        priority: "general"
      }));

      if (hasUserSkills && opportunities.length > 0) {
        // If we already have skills-based jobs, skip general ones
      } else {
        opportunities = [...opportunities, ...generalJobsWithPriority];
      }
    }

    // 4️⃣ Priority 3: On-campus jobs (if student has college info)
    if (student.education?.college) {
      console.log("🏫 Searching for on-campus jobs...");
      
      const onCampusJobs = await Job.find({ 
        jobType: "on-campus",
        college: student.education.college
      })
      .sort({ createdAt: -1 })
      .limit(5);

      console.log("🏫 On-campus jobs found:", onCampusJobs.length);

      if (onCampusJobs.length > 0) {
        const onCampusJobsWithPriority = onCampusJobs.map(job => ({
          ...job.toObject(),
          priority: "on-campus"
        }));

        opportunities = [...opportunities, ...onCampusJobsWithPriority];
      }
    }

    // 5️⃣ Determine search strategy
    const skillsCount = opportunities.filter(j => j.priority === "skills-based").length;
    const generalCount = opportunities.filter(j => j.priority === "general").length;
    const onCampusCount = opportunities.filter(j => j.priority === "on-campus").length;

    if (skillsCount > 0) {
      searchStrategy = "skills-based";
    } else if (onCampusCount > 0) {
      searchStrategy = "on-campus";
    } else {
      searchStrategy = "general";
    }

    // 6️⃣ Response message
    const getMessageDetails = () => {
      const parts = [];
      if (skillsCount > 0) parts.push(`${skillsCount} skills-matched`);
      if (onCampusCount > 0) parts.push(`${onCampusCount} on-campus`);
      if (generalCount > 0) parts.push(`${generalCount} general`);
      
      return `Found ${opportunities.length} opportunities: ${parts.join(", ")}`;
    };

    const response = {
      success: true,
      message: getMessageDetails(),
      opportunities,
      totalCount: opportunities.length,
      searchStrategy,
      userSkills: userSkillsArray,
      hasUserSkills,
      breakdown: {
        skillsBased: skillsCount,
        onCampus: onCampusCount,
        general: generalCount
      }
    };

    if (skillsCount > 0) {
      response.skillMatchDetails = opportunities
        .filter(job => job.priority === "skills-based")
        .map((job) => ({
          jobId: job._id,
          title: job.title,
          matchingSkills: job.matchingSkills || [],
          matchingSkillsCount: job.matchingSkillsCount || 0,
          totalRequiredSkills: job.preferences?.skills?.length || 0,
        }));
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error in getApplications:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching opportunities",
      error: error.message
    });
  }
};




const updateRecruiterProfile = async (req, res) => {
  try {
    const recruiterId = req.user._id; // recruiter comes from auth

    // Fields allowed to update (to prevent messing with firebaseId/verification status directly)
    const allowedUpdates = [
      "name",
      "email",
      "phone",
      "profilePicture",
      "designation",
      "company",
    ];

    // Extract only allowed fields from req.body
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Update recruiter
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      recruiterId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      recruiter: updatedRecruiter,
    });
  } catch (error) {
    console.error("Error updating recruiter profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};
// Update Application Status
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const recruiterId = req.user._id;

    // Validate status
    const validStatuses = ["applied", "shortlisted", "rejected", "hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: applied, shortlisted, rejected, hired"
      });
    }

    // Find the application and verify the job belongs to this recruiter
    const application = await Application.findById(applicationId)
      .populate({
        path: "job",
        select: "recruiter title"
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Check if the job belongs to this recruiter
    if (application.job.recruiter.toString() !== recruiterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this application"
      });
    }

    // Update the application status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    ).populate({
      path: "candidate",
      select: "email profile.firstName profile.lastName"
    });

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: updatedApplication
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating application status",
      error: error.message
    });
  }
};

export { recruiterSignup, recruiterLogin, postJob, getApplications, updateApplicationStatus };
