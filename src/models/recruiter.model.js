import mongoose from "mongoose";
import { refine } from "zod";
import { isValid } from "zod/v3";
const recruiterSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        required: true,
        index : true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    email :{
        type: String,
        required: true,
        index: true,
        unique: true,
        lowercase: true
    },
    phone:{
        type: String,
        required: false,
        index: true, //for now required is false
    },
    profilePicture: {
        type: String,
        required: false
    },
    designation:{
        type: String,
        required: true
    },
    //reference to compnay model
    companyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    isVerfied:{
        type: Boolean,
        default: false
    },
    verificationStatus:{
        type: String,
        enum: ['pending','verified','rejected'],
        default: 'pending'
    },
    activityEngagement:{
        jobsPosted:{
            type: Number,
            default: 0
        },
        activeJobs:[{
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        }]
    }


},{
    timestamps: true
})
export const Recruiter = mongoose.model("Recruiter", recruiterSchema);