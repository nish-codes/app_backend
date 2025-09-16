import { Job } from "../models/job.model.js";
import { Student } from "../models/student.model.js";


const  calculateMatchScore = async( req , res) => {
    const { jobId, userId } = req.params;

    try {
        const job = await Job.findById(jobId);
        const student = await Student.findById(userId);

        if (!job || !student) {
            return res.status(404).json({ message: "Job or Student not found" });
        }

        let totalPointNeeded = 0;
        let totalPointsEarned = 0;

        let requiredSkillsForJob = job.preferences.skills;
        let requiredSkillsForJobCount = job.preferences.skills.length;
        let studentSkills = student.user_skills ? Object.keys(student.user_skills) : [];
        let matchingSkillCount = requiredSkillsForJob.filter(skill => studentSkills.includes(skill)).length;

        totalPointNeeded += requiredSkillsForJobCount;
        totalPointsEarned += matchingSkillCount;


        let requiredExperience = job.preferences.minExperience || 0;
        let actualExperience = student.experience || 0;

        if( actualExperience >= requiredExperience){
            totalPointsEarned++;
            
        }
        totalPointNeeded += 1;

    

        let requiredLocation = job.preferences.location;

        if (requiredLocation && (student.location == requiredLocation || student.location.city == requiredLocation || student.location.state == requiredLocation || student.location.country == requiredLocation)) {
            totalPointsEarned += 1;
        }
        totalPointNeeded += 1;

        
        let score = (totalPointsEarned / totalPointNeeded) * 100;
        return res.status(200).json({ matchScore: score });

    } catch (error) {
        console.error("Error calculating match score:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export { calculateMatchScore };