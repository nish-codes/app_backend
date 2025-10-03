import express from "express"
const app = express()

app.use(express.json({
    limit: "16mb"
}))
app.use(express.urlencoded({
    limit: "16mb",
    extended: true
}))
app.use(express.static("public"))

import studentRoute from "./routes/student.route.js"
import questions from "./routes/getQuestions.route.js"
import recruiterRoute from "./routes/recruiter.route.js"
import collegeRoute from "./routes/college.route.js"
import adminRoute from "./routes/admin.route.js"

app.use("/student", studentRoute)
app.use("/recruiter", recruiterRoute)
app.use("/college", collegeRoute)
app.use("/admin", adminRoute)
app.use("/skills", questions)
export default app 