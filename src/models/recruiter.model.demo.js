import mongoose from "mongoose";
const recruiterSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: false,
    index: true, // for now required is false
  },
  profile_photo_url: {
    type: String,
    required: false,
  },
  designation: {
    type: String,
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  verification_status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },

  // companyy details
  company_id: {
    type: Schema.Types.ObjectId, // ref to company collection
    ref: "Company",
    required: true,
  },
  company_context: {
    company_name: {
      type: String,
      required: true,
    },
    company_type: {
      type: String,
      enum: ["Startup", "MNC", "NGO"],
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  activity_engagement: {
    jobs_posted: {
      type: Number,
      default: 0,
    },
    active_jobs: [
      {
        type: Schema.Types.ObjectId, // ref to job collection
        ref: "Job",
      },
    ],
    candidates_matches: [
      {
        candidate_id: {
          type: Schema.Types.ObjectId, // ref to student collection,
          ref: "Student",
        },
        match_score: Number,
      },
    ],
  },
  location_preference: {
    type: String,
    enum: ["Remote", "On-site", "Hybrid"],
    default: "Remote",
  },
  experience_level: {
    type: String,
    enum: ["Fresher", "0–2 yrs", "2–5 yrs", "5+ yrs"],
    default: "Fresher",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
export const Recruiter = mongoose.model("Recruiter", recruiterSchema);
