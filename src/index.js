
import app from "./app.js";
import { connectDb } from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});
connectDb().then(()=>{
    app.listen(3000,()=>{
        console.log("Server is running on port 3000");
    })
}
)