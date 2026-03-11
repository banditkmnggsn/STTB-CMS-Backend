import { Router } from 'express';
import * as homeContentController from '../controllers/home-content.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.get('/:section', homeContentController.getSection);
router.put('/:section', requireAuth, authorizeRoles('admin'), homeContentController.upsertSection);

export default router;