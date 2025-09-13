// src/db/index.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB connected:", db.connection.host);
  } catch (err) {
    console.error("DB connection error:", err);
  }
};

export default connectDb;
