import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { signup } from "../controllers/student.controller.js";

const route = Router();

route.post("/signup", verifyFirebaseToken, signup);

export default route;
