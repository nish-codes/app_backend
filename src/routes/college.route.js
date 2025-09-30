import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { 
  collegeSignup, 
  collegeLogin, 
  getCollegeStudents, 
  getStudentDetails, 
  postOnCampusOpportunity, 
  getCollegeOpportunities, 
  updateCollegeProfile, 
  getCollegeAnalytics 
} from "../controllers/college.controller.js";

const route = Router();

// Authentication routes
route.route("/signup").post(verifyFirebaseToken, collegeSignup);
route.route("/login").post(verifyFirebaseToken, collegeLogin);

// Student management routes
route.route("/students").get(verifyFirebaseToken, getCollegeStudents);
route.route("/students/:studentId").get(verifyFirebaseToken, getStudentDetails);

// On-campus opportunities
// route.route("/opportunities").post(verifyFirebaseToken, postOnCampusOpportunity);
route.route("/opportunities").post( postOnCampusOpportunity);
route.route("/opportunities").get(verifyFirebaseToken, getCollegeOpportunities);

// Profile management
route.route("/profile").put(verifyFirebaseToken, updateCollegeProfile);

// Analytics
route.route("/analytics").get(verifyFirebaseToken, getCollegeAnalytics);

export default route;
