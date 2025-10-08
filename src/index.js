import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import studentRoutes from "./routes/student.route.js";
import jobRoutes from "./routes/jobRoutes.js";
import recruiterRoutes from "./routes/recruiter.route.js";
import companyRoutes from "./routes/company.route.js";
import collegeRoutes from "./routes/college.route.js";
import applicationRoutes from "./routes/application.route.js";
import connectDb from "./db/index.js";
import questionRoute from './routes/getQuestions.route.js'

dotenv.config();

const app = express();

// CORS configuration - MUST be before other middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options(/.*/, cors());

// JSON middleware (after CORS)
app.use(express.json());

// Request logging middleware for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', req.body);
    }
    next();
});

// Connect MongoDB
connectDb().then(() => console.log("Database connected"));

// Routes
app.use("/student", studentRoutes);
app.use("/jobs", jobRoutes);
app.use("/recruiter", recruiterRoutes);
app.use("/company", companyRoutes);
app.use("/college", collegeRoutes);
app.use("/applications", applicationRoutes);
app.use("/skills", questionRoute);

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Backend server is running successfully',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Server startup
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
    console.log(`📱 Local network: http://0.0.0.0:${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
    }
});