

// import { dummy} from "../models/dummy.model.js";
import { Student } from "../models/student.model.js";
import { studentRequiredSchema } from "../zodschemas/student.js";

const signup = async (req, res) => {
    const {uid,email} = req.user
    const {firstName, lastName} = req.body
    try{
        const user = await Student.findOne({firebaseid: uid});
        if(user) {
            return res.status(400).json({message: "User already exists"});
        }
        const newUser = await Student.create({
            firebaseid: uid,
            email,
        profile: {
            firstName,
            lastName
        }})

        return res.status(201).json({message: "User created successfully", user: newUser});
    

    }
    catch(error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const login = async (req, res) => {
    const {uid, email} = req.user
    try {
        const user = await Student.findOne(uid)
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({message: "Login successful", user});

}
catch(error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const getHackathons = async (req, res) => {
    try{
        const hackathons = await Hackathon.find().sort({startDate: 1});
        return res.status(200).json({hackathons});
    }
    catch(error){

    }
}
const getJobs = async(req,res)=>{

}
export {signup, login};

