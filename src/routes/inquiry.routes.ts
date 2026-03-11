import { Router } from 'express';
import { body } from 'express-validator';
import * as inquiryController from '../controllers/inquiry.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.post(
  '/',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  validateRequest,
  inquiryController.submit
);

router.get('/', requireAuth, authorizeRoles('admin'), inquiryController.list);
router.put('/:id/read', requireAuth, authorizeRoles('admin'), inquiryController.markRead);
router.delete('/:id', requireAuth, authorizeRoles('admin'), inquiryController.remove);

export default router;