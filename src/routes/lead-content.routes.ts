import { Router } from 'express';
import { body } from 'express-validator';
import * as leadContentController from '../controllers/lead-content.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.get('/programs', leadContentController.listPrograms);
router.get('/:section', leadContentController.getSection);
router.put('/:section', requireAuth, authorizeRoles('admin'), leadContentController.upsertSection);

router.post(
  '/programs',
  requireAuth,
  authorizeRoles('admin'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  validateRequest,
  leadContentController.createProgram
);

router.put('/programs/:id', requireAuth, authorizeRoles('admin'), leadContentController.updateProgram);
router.delete('/programs/:id', requireAuth, authorizeRoles('admin'), leadContentController.removeProgram);

export default router;