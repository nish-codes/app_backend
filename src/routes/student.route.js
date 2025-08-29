import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { signup, login, getJobs } from "../controllers/student.controller.js";

const route = Router();

// Student signup (protected, only valid Firebase token can call this)
route.route("/signup").post(verifyFirebaseToken, signup);

// Example protected route to test decoding
route.route("/protected").get(verifyFirebaseToken, (req, res) => {
  console.log("Decoded Firebase Token:", req.user); // 👈 this will print in backend terminal
  res.json({
    message: "Protected route accessed successfully",
    user: req.user, // send decoded token (email, uid, etc.)
  });
});

export default route;
