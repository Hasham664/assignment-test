import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { authenticate, authorize } from '../middlewere/auth.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  ],
  createProject
);

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.put(
  '/:id',
  authorize('admin'),
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  ],
  updateProject
);

router.delete('/:id', authorize('admin'), deleteProject);

export default router;
