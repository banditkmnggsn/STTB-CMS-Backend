import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(requireAuth, authorizeRoles('admin'));

router.get('/', userController.list);
router.get('/:id', userController.getOne);

router.post(
  '/',
  body('email').isEmail().normalizeEmail(),
  body('username').trim().isLength({ min: 3, max: 100 }),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
  body('roleId').isUUID(),
  validateRequest,
  userController.create
);

router.put(
  '/:id',
  body('email').optional().isEmail().normalizeEmail(),
  body('username').optional().trim().isLength({ min: 3, max: 100 }),
  body('password').optional().isLength({ min: 8 }),
  body('roleId').optional().isUUID(),
  validateRequest,
  userController.update
);

router.delete('/:id', userController.remove);

export default router;