import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Job',
    },
    candidate :{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student',  // ✅ CHANGED FROM 'Candidate' TO 'Student'
    },
    status:{
        type: String,
        enum :["applied","shortlisted","rejected","hired"],
        default: "applied"
    },
    matchScore:{
        type: Number, // 0 to 100
        min: 0,
        max: 100
    },
},{
    timestamps: true
})
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
export const Application = mongoose.model("Application", applicationSchema);