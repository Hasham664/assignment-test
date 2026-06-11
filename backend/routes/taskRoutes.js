import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTask,
  getTasks,
  getTasksByProject,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate, authorize } from '../middlewere/auth.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('project').isMongoId().withMessage('Valid project ID is required'),
    body('assignedTo').isMongoId().withMessage('Valid developer ID is required'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  ],
  createTask
);

router.get('/', getTasks);
router.get('/project/:projectId', getTasksByProject);

router.put(
  '/:id',
  [
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'review', 'done'])
      .withMessage('Invalid status'),
  ],
  updateTask
);

router.delete('/:id', authorize('admin'), deleteTask);

export default router;
