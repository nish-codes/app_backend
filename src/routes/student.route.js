import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";

<<<<<<< HEAD

import {   signup,
=======
import {
    signup,
>>>>>>> 0c82f681c9973a45437903d2e27f285cec6a16f9
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
    resetSkill,
    fetchsaves,
    fetchAppliedJobs,
    getApplicationCounts,
    getAppliedApplicationsCount,
    getShortlistedApplicationsCount,
    getApplications,
    getStudentAnalytics
} from "../controllers/student.controller.js";



const router = Router();

// Authentication routes
router.post("/signup", verifyFirebaseToken, signup);
router.get("/check", verifyFirebaseToken, checkUser);
router.post("/login", verifyFirebaseToken, login);


// Profile photo upload (temporarily disabled - multer removed)
// router.post(
//     "/upload-profile-photo",
//     verifyFirebaseToken,
//     uploadProfilePhoto
// );

//skills route
router.post('/verifySkills', verifyFirebaseToken, verifySkill)
router.post('/addSkills', verifyFirebaseToken, addSkill)
router.post('/resetSkill', verifyFirebaseToken, resetSkill)

// Data fetching routes  
router.get('/details', verifyFirebaseToken, getStudentDetails)
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


router.get('/saves', verifyFirebaseToken, fetchsaves)
router.get('/fetchappliedjobs', verifyFirebaseToken, fetchAppliedJobs)
export default router;
