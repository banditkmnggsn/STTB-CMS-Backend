import { NextFunction, Request, Response } from 'express';
import { createAuditLogFromRequest } from '../services/audit-log.service';
import * as homeContentService from '../services/home-content.service';
import { sendSuccess } from '../utils/api-response';

export const getSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = String(req.params.section);
    const content = await homeContentService.getHomeContent(section);
    sendSuccess(res, content);
  } catch (error) {
    next(error);
  }
};

export const upsertSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = String(req.params.section);
    const content = await homeContentService.upsertHomeContent(section, req.body, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'home_content',
      resourceId: content.id,
      resourceTitle: section,
    });
    sendSuccess(res, content, 200, `Home content '${section}' updated successfully`);
  } catch (error) {
    next(error);
  }
};