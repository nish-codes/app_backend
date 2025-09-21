import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { signup, checkUser, login, getJobs, getHackathons, applyToJob, updateStudentProfile } from "../controllers/student.controller.js";

const router = Router();

// ✅ Authentication routes
router.post("/signup", verifyFirebaseToken, signup);
router.get("/check", verifyFirebaseToken, checkUser);
router.post("/login", verifyFirebaseToken, login);

// ✅ Data fetching routes  
router.get("/jobs", verifyFirebaseToken, getJobs);
router.get("/hackathons", verifyFirebaseToken, getHackathons);

// ✅ Action routes
router.post("/jobs/:jobId/apply", verifyFirebaseToken, applyToJob);
router.put("/profile", verifyFirebaseToken, updateStudentProfile);

export default router;