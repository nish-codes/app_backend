import { Company } from "../models/company.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import Job from "../models/job.model.js";

// Company Registration
const registerCompany = async (req, res) => {
  try {
    const {
      name,
      description,
      industry,
      website,
      location,
      size,
      companyType,
      founded,
      logo
    } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company with this name already exists"
      });
    }

    const newCompany = await Company.create({
      name,
      description,
      industry,
      website,
      location,
      size,
      companyType,
      founded,
      logo
    });

    return res.status(201).json({
      success: true,
      message: "Company registered successfully",
      company: newCompany
    });
  } catch (error) {
    console.error("Error registering company:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get All Companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('recruiters', 'name email designation')
      .populate('jobs', 'title description salaryRange jobType')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      companies,
      totalCount: companies.length
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get Company by ID
const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId)
      .populate('recruiters', 'name email designation phone profilePicture')
      .populate({
        path: 'jobs',
        select: 'title description salaryRange preferences jobType createdAt',
        options: { sort: { createdAt: -1 } }
      });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    return res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update Company
const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.recruiters;
    delete updates.jobs;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('recruiters', 'name email designation');

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete Company
const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Check if company has recruiters
    const company = await Company.findById(companyId).populate('recruiters');
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    if (company.recruiters.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete company with active recruiters. Please remove all recruiters first."
      });
    }

    // Delete all jobs associated with this company
    await Job.deleteMany({ company: companyId });

    // Delete the company
    await Company.findByIdAndDelete(companyId);

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get Company Jobs
const getCompanyJobs = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, jobType } = req.query;

    const query = { company: companyId };
    if (jobType) {
      query.jobType = jobType;
    }

    const jobs = await Job.find(query)
      .populate('recruiter', 'name email designation')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalJobs = await Job.countDocuments(query);

    return res.status(200).json({
      success: true,
      jobs,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get Company Recruiters
const getCompanyRecruiters = async (req, res) => {
  try {
    const { companyId } = req.params;

    const recruiters = await Recruiter.find({ companyId })
      .select('name email phone designation profilePicture isVerfied verificationStatus')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      recruiters,
      totalCount: recruiters.length
    });
  } catch (error) {
    console.error("Error fetching company recruiters:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompanyJobs,
  getCompanyRecruiters
};
