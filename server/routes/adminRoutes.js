import express from 'express';
import { getDashboardStats, getSystemSettings, updateSystemSettings } from '../controllers/adminController.js';
import { getIntelligenceData } from '../controllers/intelligenceController.js';
import { seedDatabase } from '../controllers/seedController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.get('/intelligence', getIntelligenceData);
router.post('/seed', seedDatabase);

export default router;
