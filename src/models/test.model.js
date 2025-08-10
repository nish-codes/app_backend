import mongoose from "mongoose";
import { number } from "zod";
import { required } from "zod/mini";

const testSchema=new mongoose.Schema({
     skill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill', // This tells Mongoose which model to reference
    required: true,
  },
    title:{
        type:String,
        required:true,
    },
    duration_seconds:{
        type:Number,
        required:true,

    },
    questions_per_test:{
        type:Number,
        required:true,
    },
    difficulty_level:{
        type:String,
    }
}) 
export const Test = mongoose.model("test", testSchema);