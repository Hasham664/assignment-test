import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { authenticate } from '../middlewere/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'developer']).withMessage('Invalid role'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
