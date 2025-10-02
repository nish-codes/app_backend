import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    jobType: {
      type: String,
      enum: ["company", "on-campus", "external"],
      default: "company",
      required: true, // Make jobType required first
    },
    
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: false
    },
    
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.jobType !== "on-campus";
      },
    },
    
    college: {
      type: String,
      required: function () {
        return this.jobType === "on-campus";
      },
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
    
    applicationLink: {
      type: String,
      required: function () {
        return this.jobType === "on-campus";
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);