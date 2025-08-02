import express from "express"
const app = express()

app.use(express.json({
    limit: "16mb"
}))
app.use(express.urlencoded({
    limit : "16mb",
    extended: true
}))
app.use(express.static("public"))

import studentRoute from "./routes/student.route.js"
app.use("/student",studentRoute)
export default app 