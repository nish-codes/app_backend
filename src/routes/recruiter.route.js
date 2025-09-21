import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { 
  recruiterLogin, 
  recruiterSignup, 
  postJob, 
  getApplications, 
  updateApplicationStatus 
} from "../controllers/recruiter.controller.js";

const route = Router()

// Authentication routes
route.route("/signup").post(verifyFirebaseToken, recruiterSignup);
route.route("/login").post(verifyFirebaseToken, recruiterLogin);

// Job management routes
route.route("/jobs").post(verifyFirebaseToken, postJob);
route.route("/jobs/:jobId/applications").get(verifyFirebaseToken, getApplications);

// Application management
route.route("/applications/:applicationId/status").put(verifyFirebaseToken, updateApplicationStatus);

export default route;

