import { Router } from "express";
import { recruiterLogin, recruiterSignup } from "../controllers/recruiter.controller.js";

const route = Router()
route.route("/signup").post(verifyFirebaseToken, recruiterSignup);
route.route("/login").post(verifyFirebaseToken, recruiterLogin);

