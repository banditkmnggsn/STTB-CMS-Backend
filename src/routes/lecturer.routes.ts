import { Router } from 'express';
import { body } from 'express-validator';
import * as lecturerController from '../controllers/lecturer.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.get('/', lecturerController.list);
router.get('/:id', lecturerController.getOne);

router.post(
  '/',
  requireAuth,
  authorizeRoles('admin'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  validateRequest,
  lecturerController.create
);

router.put(
  '/:id',
  requireAuth,
  authorizeRoles('admin'),
  body('name').optional().trim().notEmpty(),
  validateRequest,
  lecturerController.update
);

router.delete('/:id', requireAuth, authorizeRoles('admin'), lecturerController.remove);

export default router;