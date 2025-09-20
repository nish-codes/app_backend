import { Router } from "express";
import { createHackathon } from "../controllers/admin.controller.js";

const route = Router()
route.route("/createHackathon").post(createHackathon)
