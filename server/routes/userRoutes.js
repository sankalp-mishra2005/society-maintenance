import express from 'express';
import { getUsers, createUser } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUsers)
  .post(protect, adminOnly, createUser);

export default router;
