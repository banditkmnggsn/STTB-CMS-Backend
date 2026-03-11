import { Router } from 'express';
import * as mediaController from '../controllers/media.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { uploadFile } from '../middleware/upload.middleware';

const router = Router();

router.get('/', requireAuth, mediaController.list);
router.get('/:id', requireAuth, mediaController.getOne);
router.post('/upload', requireAuth, uploadFile.single('file'), mediaController.upload);
router.delete('/:id', requireAuth, authorizeRoles('admin', 'editor'), mediaController.remove);

export default router;