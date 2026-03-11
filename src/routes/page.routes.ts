import { Router } from 'express';
import { body } from 'express-validator';
import * as pageController from '../controllers/page.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.get('/', pageController.list);
router.get('/:slug', pageController.getBySlug);

router.post(
  '/',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('data').notEmpty().withMessage('Page data is required'),
  validateRequest,
  pageController.create
);

router.put(
  '/:slug',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('title').optional().trim().notEmpty(),
  validateRequest,
  pageController.update
);

router.delete('/:slug', requireAuth, authorizeRoles('admin'), pageController.remove);

export default router;