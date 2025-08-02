import mongoose from "mongoose";

const dummySchema = new mongoose.Schema({
   name :{
    type:String,
    required: true
   },age:{
    type:Number,
    required: true
   },email:{
    type:String,
    required: true
   }
})
export const dummy = mongoose.model("dummy", dummySchema);