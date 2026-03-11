import { Router } from 'express';
import { body } from 'express-validator';
import * as tagController from '../controllers/tag.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.get('/', tagController.list);
router.get('/:id', tagController.getOne);

router.post(
  '/',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  validateRequest,
  tagController.create
);

router.put(
  '/:id',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  validateRequest,
  tagController.update
);

router.delete('/:id', requireAuth, authorizeRoles('admin'), tagController.remove);

export default router;