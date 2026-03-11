import { Router } from 'express';
import { body } from 'express-validator';
import * as programController from '../controllers/program.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.get('/', programController.list);
router.get('/:slug', programController.getBySlug);
router.put('/:slug', requireAuth, authorizeRoles('admin'), programController.update);
router.put('/:slug/academic-info', requireAuth, authorizeRoles('admin'), programController.updateAcademicInfo);
router.put('/:slug/curriculum', requireAuth, authorizeRoles('admin'), programController.updateCurriculum);
router.put('/:slug/graduate-profile', requireAuth, authorizeRoles('admin'), programController.updateGraduateProfile);
router.put('/:slug/career-opportunities', requireAuth, authorizeRoles('admin'), programController.updateCareerOpportunities);

router.post(
  '/:slug/courses',
  requireAuth,
  authorizeRoles('admin'),
  body('name').trim().notEmpty().withMessage('Course name is required'),
  body('credits').isInt({ min: 1 }).withMessage('Credits must be a positive integer'),
  validateRequest,
  programController.addCourse
);

router.delete('/:slug/courses/:courseId', requireAuth, authorizeRoles('admin'), programController.removeCourse);

export default router;