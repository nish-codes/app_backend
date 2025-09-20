import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { signup , checkUser } from "../controllers/student.controller.js";

const route = Router();
route.post("/checkUser", verifyFirebaseToken, checkUser);
route.post("/signup",verifyFirebaseToken, signup);

export default route;
