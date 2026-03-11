import { Router } from 'express';
import { body } from 'express-validator';
import * as newsController from '../controllers/news.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.get('/', newsController.list);
router.get('/:slug', newsController.getBySlug);

router.post(
  '/',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status').optional().isIn(['draft', 'review', 'published']),
  body('categoryId').optional({ nullable: true }).isUUID(),
  body('tags').optional().isArray(),
  body('type').optional().isIn(['article', 'video', 'podcast', 'bulletin']),
  validateRequest,
  newsController.create
);

router.put(
  '/:id',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('title').optional().trim().notEmpty(),
  body('status').optional().isIn(['draft', 'review', 'published']),
  body('categoryId').optional({ nullable: true }).isUUID(),
  body('tags').optional().isArray(),
  body('type').optional().isIn(['article', 'video', 'podcast', 'bulletin']),
  validateRequest,
  newsController.update
);

router.delete('/:id', requireAuth, authorizeRoles('admin'), newsController.remove);

export default router;