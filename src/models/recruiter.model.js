import mongoose from "mongoose";

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
    // Embedded company details instead of reference
    company: {
        name: {
            type: String,
            required: true,
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
            type: Number, // year of establishment
        },
        logo: {
            type: String, // Cloudinary or S3 URL
        },
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