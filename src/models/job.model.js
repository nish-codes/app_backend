import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { 
      type: String, 
      required: true 
    },
    
    // New structured description fields
    rolesAndResponsibilities: {
      type: String,
      required: false
    },
    perks: {
      type: String,
      required: false
    },
    details: {
      type: String,
      required: false
    },
    
    jobType: {
      type: String,
      enum: ["company", "on-campus", "external"],
      default: "company",
      required: true,
    },
    
    // New employment type field (different from jobType)
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      required: true,
      default: "full-time"
    },
    
    // New fields
    noOfOpenings: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    
    duration: {
      type: String,
      required: false, // Optional field for contract/internship jobs
    },
    
    mode: {
      type: String,
      enum: ["remote", "on-site", "hybrid"],
      required: true,
      default: "on-site"
    },
    
    stipend: {
      type: Number,
      required: false, // Optional for internships or part-time roles
    },
    
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: false
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