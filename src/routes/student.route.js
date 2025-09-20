import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { signup , checkUser ,uploadProfilePhoto } from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const route = Router();
route.post("/checkUser", verifyFirebaseToken, checkUser);
route.post("/signup",verifyFirebaseToken, signup);

// Authenticated endpoints
route.post(
    "/upload-profile-photo",
    verifyFirebaseToken,
    upload.single("profilePhoto"),
    uploadProfilePhoto
);

export default route;
