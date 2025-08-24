import mongoose from "mongoose";
const jobSchema = new mongoose.Schema({
    title :{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    recruiter:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Recruiter',
    },
    preferences:{
         skills: [{ type: String }],   // ["React", "Node.js", "MongoDB"]
      minExperience: { type: Number }, // years of experience required
      education: { type: String },  // e.g. "B.Tech CSE"
      location: { type: String }, 
    }

});

export const Job = mongoose.model("Job", jobSchema);