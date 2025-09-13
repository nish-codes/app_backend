

// import { dummy} from "../models/dummy.model.js";
import { Student } from "../models/student.model.js";
import { studentRequiredSchema } from "../zodschemas/student.js";
import { Job } from "../models/job.model.js";

 const signup = async (req, res) => {
    const { uid, email, name, picture } = req.user; // decoded from Firebase token
  
    try {
      // 1️⃣ Check if user exists
      let user = await Student.findOne({ firebaseId: uid });
      if (user) {
        return res.status(200).json({
          message: "User already exists",
          user,
        }); 
      }
  
      // 2️⃣ Create new user with minimal info (Google signup)
      user = await Student.create({
        firebaseId: uid,
        email,
        profile: {
          firstName: name?.split(" ")[0] || "",
          lastName: name?.split(" ")[1] || "",
          profilePicture: picture || "",
        },
      });
  
      return res.status(201).json({
        message: "User created successfully",
        user,
      });
    } catch (error) {
      console.error("Error during signup:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

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
    try {
        const { q, location, skills, page = "1", limit = "20", sort = "-createdAt" } = req.query;

        const filter = {};
        if (q && typeof q === "string" && q.trim().length) {
            filter.$text = { $search: q.trim() };
        }
        if (location && typeof location === "string" && location.trim().length) {
            filter["preferences.location"] = location.trim();
        }
        if (skills && typeof skills === "string" && skills.trim().length) {
            const skillArray = skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            if (skillArray.length) {
                filter["preferences.skills"] = { $in: skillArray };
            }
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const skip = (pageNum - 1) * limitNum;

        const [jobs, total] = await Promise.all([
            Job.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .populate({
                    path: "recruiter",
                    select: "name email designation companyId",
                    populate: {
                        path: "companyId",
                        model: "Company",
                        select: "name industry location logo",
                    },
                }),
            Job.countDocuments(filter),
        ]);

        return res.status(200).json({
            data: jobs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export {signup, login, getJobs};

