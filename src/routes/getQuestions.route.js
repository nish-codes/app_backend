import express from "express";
import { jobPreference, questions, skillNames, submitQuiz } from "../controllers/questions.controller.js";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";

const router = express.Router();
router.get('/questions', questions);
router.get('/getSkills',skillNames);
router.get('/JobPrefernce',jobPreference);
router.post('/submitQuiz', verifyFirebaseToken, submitQuiz);
export default router;