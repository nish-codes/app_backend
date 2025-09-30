import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true
    },
    accessEmail: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true
    },
    accessPassword: { 
        type: String, 
        required: true 
    },
    profile: {
        logo: { type: String },
        description: { type: String, maxlength: 1000 },
        website: { type: String },
        phone: { type: String },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
            country: { type: String, default: "India" }
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    activityEngagement: {
        opportunitiesPosted: {
            type: Number,
            default: 0
        },
        activeOpportunities: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        }]
    }
}, {
    timestamps: true
});

export const College = mongoose.model("College", collegeSchema);