import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { upload } from "../middlewares/multer.middleware.js";

import { signup, checkUser, login, getJobs, getHackathons, applyToJob, updateStudentProfile, uploadProfilePhoto, getStudentDetails, verifySkill, addSkill, resetSkill } from "../controllers/student.controller.js";
import {   signup,
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
  
    fetchsaves,
    fetchAppliedJobs,
  
    getApplicationCounts,
    getAppliedApplicationsCount,
    getShortlistedApplicationsCount,
    getApplications,
    getStudentAnalytics,
   } from "../controllers/student.controller.js";


const router = Router();

// Authentication routes
router.post("/signup", verifyFirebaseToken, signup);
router.get("/check", verifyFirebaseToken, checkUser);
router.post("/login", verifyFirebaseToken, login);


// Profile photo upload
router.post(
    "/upload-profile-photo",
    verifyFirebaseToken,
    upload.single("profilePhoto"),
    uploadProfilePhoto
);

//skills route
router.post('/verifySkills', verifyFirebaseToken, verifySkill)
router.post('/addSkills', verifyFirebaseToken, addSkill)
router.post('/resetSkill', verifyFirebaseToken, resetSkill)
// ✅ Data fetching routes  
router.get('/StudentDetails', verifyFirebaseToken, getStudentDetails)
// Data fetching routes  
router.get("/jobs", verifyFirebaseToken, getJobs);
router.get("/hackathons", verifyFirebaseToken, getHackathons);

// Application counts
router.get("/applications/counts", verifyFirebaseToken, getApplicationCounts);
router.get("/applications/counts/applied", verifyFirebaseToken, getAppliedApplicationsCount);
router.get("/applications/counts/shortlisted", verifyFirebaseToken, getShortlistedApplicationsCount);

// Applications list
router.get("/applications", verifyFirebaseToken, getApplications);

// Analytics
router.get("/analytics", verifyFirebaseToken, getStudentAnalytics);

// Action routes
router.post("/jobs/:jobId/:jobtype/apply", verifyFirebaseToken, applyToJob);
router.put("/profile", verifyFirebaseToken, updateStudentProfile);


router.get('/saves',verifyFirebaseToken,fetchsaves)
router.get('/fetchappliedjobs',verifyFirebaseToken,fetchAppliedJobs)
export default router;
