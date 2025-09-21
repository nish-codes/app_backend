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
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    profilePicture: { type: String },
    bio: { type: String, maxlength: 500 },
    dateOfBirth: { type: Date, required: false },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pincode: { type: String },
    },
  },
  education: {
    college: { type: String, index: true },
    degree: { type: String },
    branch: { type: String },
    year: { type: Number },
    cgpa: { type: Number, min: 0, max: 10 },
    graduationYear: { type: Number, required: false },
  },
  user_skills: {
    type: mongoose.Schema.Types.Mixed,
    default: {}, // Empty object
    description: "A summary of the user's highest-level skills and their associated badges.",
  },
});

export const Student = mongoose.model("Student", studentSchema);
