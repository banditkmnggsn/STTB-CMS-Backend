import { Router } from 'express';
import * as auditLogController from '../controllers/audit-log.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.get('/', requireAuth, authorizeRoles('admin'), auditLogController.list);

export default router;