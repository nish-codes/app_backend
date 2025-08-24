import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipcode: String,
    },

    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
    },
    companyType: {
      type: String,
      enum: ["Startup", "MNC", "SME", "Government", "Non-Profit"],
      default: "Startup",
    },

    founded: {
      type: Number,
    },

    // Each company has recruiters (HR, hiring managers, etc.)
    recruiters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
      },
    ],

    // List of jobs posted by this company
    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    logo: {
      type: String, // Cloudinary or S3 URL
    },
})

export const Company = mongoose.model("Company", companySchema);