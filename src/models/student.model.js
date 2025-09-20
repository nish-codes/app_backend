import mongoose from "mongoose";
import { required } from "zod/mini";

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
    profilePicture: { type: String },
    bio: { type: String, maxlength: 500, default:""},
    // gender: {
    //   type: String,
    //   enum: ["male", "female", "other", "prefer-not-to-say"],
    // },
    // location: {
    //   city: { type: String },
    //   state: { type: String },
    //   country: { type: String },
    //   pincode: { type: String },
    // },
  },
  education: {
    college: { type: String, index: true,},
    universityType:{type:String,
      enum:["deemed","public","private"]},
    degree: { type: String,},
    collegeEmail:{type:String,}
    // branch: { type: String },
    // year: { type: Number },
    // cgpa: { type: Number, min: 0, max: 10 },
    // graduationYear: { type: Number, required: false },
  },
  // user_skills: {
  //   type: mongoose.Schema.Types.Mixed,
  //   default: {}, // Empty object
  //   description: "A summary of the user's highest-level skills and their associated badges.",
  // },
  user_skills: {
  type: Map,
  of: new mongoose.Schema({
    level: {
      type: String,
      enum: ["beginner", "mid", "adv"], // only allowed values
      required: true
    }
  }, { _id: false }),
  default: {}
  },
  job_preference:{
    type:[String],
    required:true,
  },
  experience: [
    {
      nameOfOrg: { type: String,  },
      position: { type: String,  },
      timeline: { type: String },
      description: { type: String },  // short explanation of the position
      _id: false,
    }
  ],
  projects:[
    {
      projectName: { type: String, },
      link: { type: String },        // can store a GitHub/demo(hosted) link
      description: { type: String },  // short explanation of the project
      _id: false,
    }
  ]
},{ timestamps: true });

export const Student = mongoose.model("Student", studentSchema);
