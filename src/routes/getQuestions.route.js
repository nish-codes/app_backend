import express from "express";
import { jobPreference, questions, skillNames } from "../controllers/questions.controller.js";
const router = express.Router();
router.get('/questions', questions);
router.get('/getSkills',skillNames);
router.get('/JobPrefernce',jobPreference)
export default router;