import { Router } from 'express';
import { getAdminDashboard, getDevDashboard } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middlewere/auth.js';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/dev', getDevDashboard);

export default router;
