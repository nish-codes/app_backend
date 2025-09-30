import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    index: true,
    unique: true,
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
    index: true,
  },
  profile: {
    FullName: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    bio: { type: String, maxlength: 500, default: "" },
  },
  education: {
    college: { type: String, index: true, default: "" },
    universityType: {
      type: String,
      enum: ["deemed", "public", "private"],
      default: "public"
    },
    degree: { type: String, default: "" },
    collegeEmail: { type: String, default: "" },
    yearOfPassing: { type: Number, default: null }
  },

  user_skills: {
    type: Map,
    of: new mongoose.Schema({
      level: {
        type: String,
        enum: ["beginner", "mid", "adv"],
        required: true
      }
    }, { _id: false }),
    default: new Map()
  },
  
  job_preference: {
    type: [String],
    required: true,
    default: []
  },
  
  experience: [
    {
      nameOfOrg: { type: String, default: "" },
      position: { type: String, default: "" },
      timeline: { type: String, default: "" },
      description: { type: String, default: "" },
      _id: false,
    }
  ],
  
  projects: [
    {
      projectName: { type: String, default: "" },
      link: { type: String, default: "" },
      description: { type: String, default: "" },
      _id: false,
    }
  ],

  // ✅ saves is now a LIST of job IDs
  saves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    }
  ]

}, { timestamps: true });

export const Student = mongoose.model("Student", studentSchema);
