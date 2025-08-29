import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { recruiterSignup, recruiterLogin, postJob } from "../controllers/recruiter.controller.js";

const router = Router();

// Recruiter signup
router.post("/signup", verifyFirebaseToken, recruiterSignup);

// Recruiter login
router.post("/login", verifyFirebaseToken, recruiterLogin);

// Recruiter post job
router.post("/post-job", verifyFirebaseToken, postJob);

export default router;
