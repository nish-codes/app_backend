import express from 'express';
import {
    registerCompany,
    updateCompany,
    getCompany,
    getCompanyJobs,
    getCompanyApplications,
    deleteCompany,
    getAllRecruiters,
    clearTestData,
    checkUserRegistration,
    getCompanyByUID
} from '../controllers/company.controller.js';
import { verifyFirebaseToken } from '../middlewares/verifyFirebaseToken.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerCompany);
router.get('/check-registration/:uid', checkUserRegistration);
router.get('/by-uid/:uid', getCompanyByUID);

// Test route first
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Company routes working' });
});

// Debug routes (no auth for testing)
router.get('/debug/all', getAllRecruiters);
router.delete('/debug/clear-test-data', clearTestData);

// Protected routes (authentication required)
router.use(verifyFirebaseToken); // Apply middleware to all routes below
router.get('/:id', getCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
router.get('/:id/jobs', getCompanyJobs);
router.get('/:id/applications', getCompanyApplications);

export default router;