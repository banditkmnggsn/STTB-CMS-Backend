import { Router } from 'express';
import { body } from 'express-validator';
import * as eventController from '../controllers/event.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.get('/', eventController.list);
router.get('/:id', eventController.getOne);

router.post(
  '/',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('eventDate').notEmpty().isISO8601().withMessage('eventDate must be a valid ISO date'),
  validateRequest,
  eventController.create
);

router.put(
  '/:id',
  requireAuth,
  authorizeRoles('admin', 'editor'),
  body('eventDate').optional().isISO8601(),
  validateRequest,
  eventController.update
);

router.delete('/:id', requireAuth, authorizeRoles('admin'), eventController.remove);

export default router;