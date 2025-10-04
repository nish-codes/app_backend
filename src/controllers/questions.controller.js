import fs from "fs";
import skills from "../db/skills.json" with { type: "json" }
import totalSkills from "../db/total_skills.json" with { type: "json" }
import job_preference from "../db/job_preference.json" with { type: "json" }
import { Student } from "../models/student.model.js"
const questions = (req, res) => {
    const { lvl, skill } = req.query;
    // Filter skills based on query
    const filtered = skills.filter(s => s.Difficulty == lvl && s.Skill == skill);

    if (filtered.length === 0) {
        return res.status(404).json({ message: 'No matching skill found' });
    }

    const skillObj = filtered[0]; // take the first matching object

    // Get numeric keys only
    const numericKeys = Object.keys(skillObj).filter(key => !isNaN(Number(key)));

    // Get values of numeric keys (the actual questions)
    const questions = numericKeys.map(key => skillObj[key]);

    // Picking random questions
    const getRandomItems = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);
    const randomQuestions = getRandomItems(questions, 10);

    res.json(randomQuestions);
}

const skillNames=(req,res)=>{
    res.send(totalSkills);
}
const jobPreference=(req , res)=>{
    res.send(job_preference)
}

// Submit quiz results and automatically update skill level
const submitQuiz = async (req, res) => {
    try {
        const { skillName, difficulty, score, totalQuestions, answers } = req.body;
        const uid = req.user?.uid;
        
        if (!uid) {
            return res.status(400).json({ message: "Missing Firebase UID" });
        }
        
        if (!skillName || !difficulty || score === undefined || !totalQuestions) {
            return res.status(400).json({ 
                message: "Missing required fields: skillName, difficulty, score, totalQuestions" 
            });
        }
        
        // Find the student
        const student = await Student.findOne({ firebaseId: uid });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        // Check if skill exists
        if (!student.user_skills.has(skillName)) {
            return res.status(400).json({ 
                message: "Skill does not exist. Add the skill first before taking the quiz." 
            });
        }
        
        // Calculate percentage score
        const percentageScore = (score / totalQuestions) * 100;
        
        // Determine skill level based on score and difficulty
        let newLevel;
        if (percentageScore >= 80) {
            // High score - can achieve higher levels
            if (difficulty === "Beginner") {
                newLevel = "beginner";
            } else if (difficulty === "Intermediate") {
                newLevel = "mid";
            } else if (difficulty === "Advanced") {
                newLevel = "advance";
            } else {
                newLevel = "beginner"; // fallback
            }
        } else if (percentageScore >= 60) {
            // Medium score - can achieve beginner to mid levels
            if (difficulty === "Beginner") {
                newLevel = "beginner";
            } else if (difficulty === "Intermediate") {
                newLevel = "beginner";
            } else {
                newLevel = "beginner"; // fallback for advanced
            }
        } else {
            // Low score - remains unverified
            newLevel = "unverified";
        }
        
        // Update the skill level
        student.user_skills.set(skillName, { level: newLevel });
        await student.save();
        
        return res.status(200).json({
            success: true,
            message: "Quiz submitted successfully",
            data: {
                skillName,
                difficulty,
                score,
                totalQuestions,
                percentageScore: Math.round(percentageScore),
                newLevel,
                skillUpdated: newLevel !== "unverified"
            }
        });
        
    } catch (error) {
        console.error("Error submitting quiz:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error", 
            error: error.message 
        });
    }
};

export { questions , skillNames , jobPreference, submitQuiz };