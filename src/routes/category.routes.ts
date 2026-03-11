import { Router } from 'express';
import { body } from 'express-validator';
import * as categoryController from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.get('/', categoryController.list);
router.get('/:id', categoryController.getOne);

router.post(
  '/',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  validateRequest,
  categoryController.create
);

router.put(
  '/:id',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('name').optional().trim().notEmpty(),
  validateRequest,
  categoryController.update
);

router.delete('/:id', requireAuth, authorizeRoles('admin'), categoryController.remove);

export default router;