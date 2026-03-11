import { NextFunction, Request, Response } from 'express';
import { createAuditLogFromRequest } from '../services/audit-log.service';
import * as pageService from '../services/page.service';
import { sendCreated, sendDeleted, sendSuccess } from '../utils/api-response';

export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = await pageService.listPages();
    sendSuccess(res, pages);
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await pageService.getPageBySlug(String(req.params.slug));
    sendSuccess(res, page);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await pageService.createPage(req.body, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'created',
      resourceType: 'page',
      resourceId: page.id,
      resourceTitle: page.title,
    });
    sendCreated(res, page, 'Page created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await pageService.updatePage(String(req.params.slug), req.body, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'page',
      resourceId: page.id,
      resourceTitle: page.title,
    });
    sendSuccess(res, page, 200, 'Page updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await pageService.deletePage(String(req.params.slug));
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};