import { Router } from 'express';
import * as siteSettingsController from '../controllers/site-settings.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.get('/', siteSettingsController.getAll);
router.get('/:category', siteSettingsController.getByCategory);
router.put('/:category', requireAuth, authorizeRoles('admin'), siteSettingsController.upsert);

export default router;