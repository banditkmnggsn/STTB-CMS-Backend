import { NextFunction, Request, Response } from 'express';
import { createAuditLogFromRequest } from '../services/audit-log.service';
import * as programService from '../services/program.service';
import { sendCreated, sendDeleted, sendSuccess } from '../utils/api-response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const programs = await programService.listPrograms(req.query.all !== 'true');
    sendSuccess(res, programs);
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await programService.getProgramBySlug(String(req.params.slug));
    sendSuccess(res, program);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await programService.updateProgram(String(req.params.slug), req.body, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'program',
      resourceId: program.id,
      resourceTitle: program.title,
    });
    sendSuccess(res, program, 200, 'Program updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateAcademicInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await programService.updateAcademicInfo(String(req.params.slug), req.body, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'program',
      resourceId: program.id,
      resourceTitle: `${program.title} academic info`,
    });
    sendSuccess(res, program, 200, 'Academic info updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCurriculum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await programService.updateCurriculumCategories(
      String(req.params.slug),
      req.body.categories ?? req.body,
      req.user!.id
    );
    sendSuccess(res, program, 200, 'Curriculum updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateGraduateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await programService.updateGraduateProfile(String(req.params.slug), req.body, req.user!.id);
    sendSuccess(res, program, 200, 'Graduate profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCareerOpportunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await programService.updateCareerOpportunities(String(req.params.slug), req.body, req.user!.id);
    sendSuccess(res, program, 200, 'Career opportunities updated successfully');
  } catch (error) {
    next(error);
  }
};

export const addCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await programService.addCourse(String(req.params.slug), req.body, req.user!.id);
    sendCreated(res, course, 'Course added successfully');
  } catch (error) {
    next(error);
  }
};

export const removeCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await programService.deleteCourse(String(req.params.slug), String(req.params.courseId), req.user!.id);
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};