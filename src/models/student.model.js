import mongoose from "mongoose"
const studentSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        required: true,
        index : true,
        unique: true
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
    profile:{
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
    },
    profilePicture: {
        type: String
    },
    bio:{
        type: String,
        maxlength: 500
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender:{
        type: String,
        enum:['male','female','other','prefer-not-to-say']
    },
    location: {
        city: {
            type: String,
            
        },
        state: {
            type: String,
           
        },
        country: {
            type: String,
           
        },
        pincode: {
            type: String,
           
        }
    }
},
education:{
    college:{
        type: String,
        
        index: true
    },
    degree:{
        type: String,
        
    },
    branch:{
        type: String,
       
    },
    year:{
        type: Number,
      
    },
    cgpa:{
        type: Number,
      
        min: 0,
        max: 10
    },
    graduationYear:{
        type: Number,
        required: true
    }
},
 user_skills: {
        type: mongoose.Schema.Types.Mixed,
        default: {}, // Initialize as an empty object
        description: "A summary of the user's highest-level skills and their associated badges."
    },
    
})

export const Student = mongoose.model("Student", studentSchema)