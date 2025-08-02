import mongoose from "mongoose";
import { db_name } from "../constant.js";


export const connectDb = async()=>{
         try {
            const db = await mongoose.connect(`${process.env.MONGODB_URL}${db_name}`)
            console.log("Database connected successfully"+ db.connection.host)
         } catch (error) {
            console.log("Database connection failed", error)
            process.exit(1)
         }
    }
    
