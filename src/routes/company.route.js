import express from "express";
import {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompanyJobs,
  getCompanyRecruiters
} from "../controllers/company.controller.js";

const router = express.Router();

// Company registration and management routes
router.post("/register", registerCompany);
router.get("/", getAllCompanies);
router.get("/:companyId", getCompanyById);
router.put("/:companyId", updateCompany);
router.delete("/:companyId", deleteCompany);

// Company-specific data routes
router.get("/:companyId/jobs", getCompanyJobs);
router.get("/:companyId/recruiters", getCompanyRecruiters);

export default router;
