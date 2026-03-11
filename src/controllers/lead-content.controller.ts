import { NextFunction, Request, Response } from 'express';
import { createAuditLogFromRequest } from '../services/audit-log.service';
import * as leadContentService from '../services/lead-content.service';
import { sendCreated, sendDeleted, sendSuccess } from '../utils/api-response';

export const getSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = String(req.params.section);
    const content = await leadContentService.getLeadContent(section);
    sendSuccess(res, content);
  } catch (error) {
    next(error);
  }
};

export const upsertSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = String(req.params.section);
    const content = await leadContentService.upsertLeadContent(section, req.body, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'lead_content',
      resourceId: content.id,
      resourceTitle: section,
    });
    sendSuccess(res, content, 200, `LEAD content '${section}' updated successfully`);
  } catch (error) {
    next(error);
  }
};

export const listPrograms = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const programs = await leadContentService.listLeadPrograms();
    sendSuccess(res, programs);
  } catch (error) {
    next(error);
  }
};

export const createProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await leadContentService.createLeadProgram(req.body, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'created',
      resourceType: 'lead_program',
      resourceId: String(program.id),
      resourceTitle: String(req.body.title ?? 'LEAD program'),
    });
    sendCreated(res, program, 'LEAD program created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await leadContentService.updateLeadProgram(String(req.params.id), req.body, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'lead_program',
      resourceId: String(req.params.id),
      resourceTitle: String(req.body.title ?? 'LEAD program'),
    });
    sendSuccess(res, program, 200, 'LEAD program updated successfully');
  } catch (error) {
    next(error);
  }
};

export const removeProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await leadContentService.deleteLeadProgram(String(req.params.id), req.user!.id);
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};