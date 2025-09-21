import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";

import { signup, checkUser, login, getJobs, getHackathons, applyToJob, updateStudentProfile , uploadProfilePhoto, getStudentDetails, verifySkill, addSkill } from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ✅ Authentication routes
router.post("/signup", verifyFirebaseToken, signup);
router.post("/checkUser", verifyFirebaseToken, checkUser);
router.post("/login", verifyFirebaseToken, login);


// Authenticated endpoints
router.post(
    "/upload-profile-photo",
    verifyFirebaseToken,
    upload.single("profilePhoto"),
    uploadProfilePhoto
);

//skills route
router.post('/verifySkills',verifyFirebaseToken,verifySkill)
router.post('/addSkills',verifyFirebaseToken,addSkill)
// ✅ Data fetching routes  
router .post('./StudentDetails',verifyFirebaseToken,getStudentDetails)
router.get("/jobs", verifyFirebaseToken, getJobs);
router.get("/hackathons", verifyFirebaseToken, getHackathons);

// ✅ Action routes
router.post("/jobs/:jobId/apply", verifyFirebaseToken, applyToJob);
router.put("/profile", verifyFirebaseToken, updateStudentProfile);

export default router;