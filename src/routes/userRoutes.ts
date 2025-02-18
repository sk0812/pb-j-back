import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Protected routes (require authentication)
router.post('/profile', authenticateUser, userController.createProfile);
router.get('/profile', authenticateUser, userController.getProfile);
router.put('/profile', authenticateUser, userController.updateProfile);

export default router; 