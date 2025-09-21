import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Recruiter",
    },
    salaryRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    preferences: {
      skills: [{ type: String }],
      minExperience: { type: Number },
      education: { type: String },
      location: { type: String },
    },
   
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
