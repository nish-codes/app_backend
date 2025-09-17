import express from "express";
import { questions } from "../controllers/questions.controller";
const router = express.Router();
router.get('/questions', questions);
export default router;