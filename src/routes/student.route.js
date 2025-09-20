import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { signup, uploadProfilePhoto } from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const route = Router();


// Authenticated endpoints
route.post("/signup", verifyFirebaseToken, signup);
route.post(
    "/upload-profile-photo",
    verifyFirebaseToken,
    upload.single("profilePhoto"),
    uploadProfilePhoto
);

export default route;
