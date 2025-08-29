import express from "express";
import cors from "cors";

const app = express();

// ✅ Enable CORS for frontend
app.use(cors({
    origin: "http://localhost:3001",   // React app port
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Body parsers
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ limit: "16mb", extended: true }));

// ✅ Static files
app.use(express.static("public"));

// ✅ Routes
import studentRoute from "./routes/student.route.js";
import recruiterRoute from "./routes/recruiter.route.js";

app.use("/student", studentRoute);
app.use("/recruiter", recruiterRoute);

export default app;
