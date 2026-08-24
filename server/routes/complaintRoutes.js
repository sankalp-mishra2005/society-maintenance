import express from 'express';
import {
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority
} from '../controllers/complaintController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', upload.single('photo'), createComplaint);
router.put('/:id', upload.single('photo'), updateComplaint);
router.delete('/:id', deleteComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.patch('/:id/status', adminOnly, updateComplaintStatus);
router.patch('/:id/priority', adminOnly, updateComplaintPriority);

export default router;
