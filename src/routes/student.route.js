import { Router } from "express";

import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
// import { addstudent } from "../controllers/student.controller.js";

const route = Router()

// route.route("/add").post(addstudent);

route.route("/signup").post(verifyFirebaseToken, signup);

export default route