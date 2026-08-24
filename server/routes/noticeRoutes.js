import express from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotices);
router.post('/', adminOnly, createNotice);
router.delete('/:id', adminOnly, deleteNotice);

export default router;
