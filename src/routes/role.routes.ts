import { Router } from 'express';
import { body } from 'express-validator';
import * as roleController from '../controllers/role.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(requireAuth, authorizeRoles('admin'));

router.get('/', roleController.list);
router.get('/:id', roleController.getOne);

router.post(
  '/',
  body('name').trim().notEmpty().withMessage('Role name is required'),
  body('permissions').notEmpty().withMessage('Permissions are required'),
  validateRequest,
  roleController.create
);

router.put(
  '/:id',
  body('name').optional().trim().notEmpty(),
  validateRequest,
  roleController.update
);

export default router;