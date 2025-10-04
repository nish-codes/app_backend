import { Hackathon } from "../models/hackathon.model.js";

const createHackathon = async (req, res) => {
    try{
        const adminPassword = req.headers['admin-password'];
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(403).json({ message: "Forbidden: Invalid admin password" });
        }
        const { title, organizer, description, location, startDate, endDate, registrationDeadline, prizePool, eligibility, website } = req.body;
        if (!title || !organizer || !description || !location || !startDate || !endDate || !registrationDeadline) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
        const newHackathon = await Hackathon.create({
            title,
            organizer,
            description,
            location,
            startDate,
            endDate,
            registrationDeadline,
            prizePool,
            eligibility,
            organizedBy,
            mode,
            website
        });
        
            
             return res.status(201).json({ message: "Hackathon created successfully", hackathon: newHackathon });
        
    }
    catch(error){
        console.error("Error during hackathon creation:", error);
    }
}
export {createHackathon};