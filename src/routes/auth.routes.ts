import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', requireAuth, authController.me);

// Example RBAC-protected endpoint for quick verification.
router.get('/admin-only', requireAuth, authorizeRoles('admin'), (_req, res) => {
  res.status(200).json({ success: true, message: 'You are authorized as admin' });
});

export default router;
