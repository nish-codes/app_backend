import express from "express";
import dotenv from "dotenv";
import studentRoutes from "./routes/student.route.js";
import jobRoutes from "./routes/jobRoutes.js";   // ✅ here
import recruiterRoutes from "./routes/recruiter.route.js";
import collegeRoutes from "./routes/college.route.js";
import connectDb from "./db/index.js";

dotenv.config();

const app = express();
app.use(express.json());

// Connect MongoDB
connectDb().then(() => console.log("Database connected"));

// Routes
app.use("/student", studentRoutes);
app.use("/jobs", jobRoutes);   // ✅ now jobs are available
app.use("/recruiter", recruiterRoutes);
app.use("/college", collegeRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
