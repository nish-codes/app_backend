import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    organizer: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    prizePool: { type: String },
    eligibility: { type: String, default: "Open to all" },
    organizedBy: { type: String },
    mode:{type:String},
    website: { type: String },
},{timestamps: true})


export const Hackathon = mongoose.model("Hackathon", hackathonSchema);