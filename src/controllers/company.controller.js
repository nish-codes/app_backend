import { Recruiter as RecruiterModel } from '../models/recruiter.model.js';
import JobModel from '../models/job.model.js';
import { Application as ApplicationModel } from '../models/application.model.js';

// Register a new company (creates a recruiter with embedded company data)
export const registerCompany = async (req, res) => {
    try {
        console.log('Company registration request received:', req.body);

        const {
            companyName,
            companyEmail,
            industry,
            companySize,
            website,
            description,
            location,
            // Recruiter data
            recruiterName,
            recruiterEmail,
            recruiterPhone,
            position,
            uid
        } = req.body;

        // Validate required fields
        if (!companyName || !companyEmail || !recruiterName || !recruiterEmail || !uid) {
            return res.status(400).json({
                success: false,
                message: 'Required fields missing: companyName, companyEmail, recruiterName, recruiterEmail, uid'
            });
        }

        // Check if company/recruiter already exists
        const existingRecruiter = await RecruiterModel.findOne({
            $or: [
                { 'company.email': companyEmail },
                { email: recruiterEmail },
                { uid: uid }
            ]
        });

        if (existingRecruiter) {
            return res.status(409).json({
                success: false,
                message: 'Company or recruiter already exists'
            });
        }

        // Create new recruiter with embedded company data
        const newRecruiter = new RecruiterModel({
            firebaseId: uid || 'temp_' + Date.now(), // Required field
            name: recruiterName,
            email: recruiterEmail,
            phone: recruiterPhone,
            designation: position || 'HR Manager', // Required field, was 'position' 
            company: {
                name: companyName,
                description: description,
                industry: industry,
                website: website,
                location: location && typeof location === 'object' ? {
                    address: location.address || '',
                    city: location.city || '',
                    state: location.state || '',
                    country: location.country || '',
                    zipcode: location.zipcode || ''
                } : (location && typeof location === 'string') ? {
                    city: location,
                    address: '',
                    state: '',
                    country: '',
                    zipcode: ''
                } : {
                    address: '',
                    city: '',
                    state: '',
                    country: '',
                    zipcode: ''
                },
                size: companySize,
                founded: new Date().getFullYear(),
                logo: ''
            }
        });

        const savedRecruiter = await newRecruiter.save();

        res.status(201).json({
            success: true,
            message: 'Company registered successfully',
            data: {
                recruiterId: savedRecruiter._id,
                company: savedRecruiter.company,
                recruiter: {
                    id: savedRecruiter._id,
                    name: savedRecruiter.name,
                    email: savedRecruiter.email,
                    position: savedRecruiter.position
                }
            }
        });

    } catch (error) {
        console.error('Company registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during company registration',
            error: error.message
        });
    }
};

// Get company details by recruiter ID
export const getCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const recruiter = await RecruiterModel.findById(id);
        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                company: recruiter.company,
                recruiter: {
                    id: recruiter._id,
                    name: recruiter.name,
                    email: recruiter.email,
                    position: recruiter.position
                }
            }
        });

    } catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching company details',
            error: error.message
        });
    }
};

// Update company details
export const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Separate company and recruiter data
        const companyUpdates = {};
        const recruiterUpdates = {};

        // Company fields
        const companyFields = ['name', 'email', 'industry', 'size', 'website', 'description', 'location', 'logo', 'founded', 'employees'];
        companyFields.forEach(field => {
            if (updateData[field] !== undefined) {
                companyUpdates[`company.${field}`] = updateData[field];
            }
        });

        // Recruiter fields
        const recruiterFields = ['name', 'email', 'phone', 'position'];
        recruiterFields.forEach(field => {
            if (updateData[`recruiter${field.charAt(0).toUpperCase() + field.slice(1)}`] !== undefined) {
                recruiterUpdates[field] = updateData[`recruiter${field.charAt(0).toUpperCase() + field.slice(1)}`];
            }
        });

        const updateObject = { ...companyUpdates, ...recruiterUpdates };

        const updatedRecruiter = await RecruiterModel.findByIdAndUpdate(
            id,
            updateObject,
            { new: true, runValidators: true }
        );

        if (!updatedRecruiter) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Company updated successfully',
            data: {
                company: updatedRecruiter.company,
                recruiter: {
                    id: updatedRecruiter._id,
                    name: updatedRecruiter.name,
                    email: updatedRecruiter.email,
                    position: updatedRecruiter.position
                }
            }
        });

    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating company',
            error: error.message
        });
    }
};

// Delete company (and associated recruiter)
export const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        // Also delete associated jobs and applications
        await JobModel.deleteMany({ postedBy: id });
        await ApplicationModel.deleteMany({ recruiterId: id });

        const deletedRecruiter = await RecruiterModel.findByIdAndDelete(id);

        if (!deletedRecruiter) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Company and associated data deleted successfully'
        });

    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting company',
            error: error.message
        });
    }
};

// Get all jobs posted by company
export const getCompanyJobs = async (req, res) => {
    try {
        const { id } = req.params;

        const jobs = await JobModel.find({ postedBy: id })
            .populate('postedBy', 'name company.name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: jobs
        });

    } catch (error) {
        console.error('Get company jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching company jobs',
            error: error.message
        });
    }
};

// Get all applications for company's jobs
export const getCompanyApplications = async (req, res) => {
    try {
        const { id } = req.params;

        const applications = await ApplicationModel.find({ recruiterId: id })
            .populate('studentId', 'name email phone')
            .populate('jobId', 'title department')
            .sort({ appliedAt: -1 });

        res.status(200).json({
            success: true,
            data: applications
        });

    } catch (error) {
        console.error('Get company applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching company applications',
            error: error.message
        });
    }
};

// DEBUG: Get all recruiters (for debugging purposes)
export const getAllRecruiters = async (req, res) => {
    try {
        const recruiters = await RecruiterModel.find({})
            .select('name email company.name firebaseId')
            .limit(10);

        res.status(200).json({
            success: true,
            count: recruiters.length,
            data: recruiters
        });

    } catch (error) {
        console.error('Get all recruiters error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recruiters',
            error: error.message
        });
    }
};

// Check if user is already registered by Firebase UID
export const checkUserRegistration = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: 'Firebase UID is required'
            });
        }

        const existingRecruiter = await RecruiterModel.findOne({ firebaseId: uid })
            .select('name email company._id company.name');

        if (existingRecruiter) {
            return res.status(200).json({
                success: true,
                isRegistered: true,
                data: {
                    recruiterId: existingRecruiter._id,
                    recruiterName: existingRecruiter.name,
                    recruiterEmail: existingRecruiter.email,
                    companyId: existingRecruiter.company._id,
                    companyName: existingRecruiter.company.name
                }
            });
        } else {
            return res.status(200).json({
                success: true,
                isRegistered: false,
                message: 'User not registered yet'
            });
        }

    } catch (error) {
        console.error('Check user registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking user registration status',
            error: error.message
        });
    }
};

// Get complete company data by Firebase UID (public endpoint)
export const getCompanyByUID = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: 'Firebase UID is required'
            });
        }

        const recruiter = await RecruiterModel.findOne({ firebaseId: uid });

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: 'Company not found for this user'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                company: recruiter.company,
                recruiter: {
                    id: recruiter._id,
                    name: recruiter.name,
                    email: recruiter.email,
                    phone: recruiter.phone,
                    designation: recruiter.designation,
                    profilePicture: recruiter.profilePicture
                }
            }
        });

    } catch (error) {
        console.error('Get company by UID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching company details',
            error: error.message
        });
    }
};

// DEBUG: Clear test data (for development only)
export const clearTestData = async (req, res) => {
    try {
        // Only allow in development/test environment
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'Not allowed in production'
            });
        }

        const result = await RecruiterModel.deleteMany({
            $or: [
                { firebaseId: { $regex: /^test_|^diagnosis_|^fixed_test_|^unique_test_/ } },
                { name: { $regex: /^Test|^Diagnosis|^Fixed Test|^Unique/ } }
            ]
        });

        res.status(200).json({
            success: true,
            message: `Cleared ${result.deletedCount} test records`
        });

    } catch (error) {
        console.error('Clear test data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing test data',
            error: error.message
        });
    }
};