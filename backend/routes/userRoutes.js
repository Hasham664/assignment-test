import { Router } from 'express';
import { body } from 'express-validator';
import { getUsers, updateUserRole, getDevelopers } from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewere/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/developers', getDevelopers);
router.patch(
  '/:id/role',
  [body('role').isIn(['admin', 'developer']).withMessage('Invalid role')],
  updateUserRole
);

export default router;
