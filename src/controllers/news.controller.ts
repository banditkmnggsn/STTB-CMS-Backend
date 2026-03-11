import { NextFunction, Request, Response } from 'express';
import { createAuditLogFromRequest } from '../services/audit-log.service';
import * as newsService from '../services/news.service';
import { sendCreated, sendDeleted, sendPaginated, sendSuccess } from '../utils/api-response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { articles, pagination } = await newsService.listNews(req.query as Record<string, unknown>);
    sendPaginated(res, articles, pagination);
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await newsService.getNewsBySlug(String(req.params.slug));
    sendSuccess(res, article);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await newsService.createNews({ ...req.body, authorId: req.user!.id });
    await createAuditLogFromRequest(req, {
      action: 'created',
      resourceType: 'news_article',
      resourceId: article.id,
      resourceTitle: article.title,
    });
    sendCreated(res, article, 'Article created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await newsService.updateNews(String(req.params.id), req.body);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'news_article',
      resourceId: article.id,
      resourceTitle: article.title,
    });
    sendSuccess(res, article, 200, 'Article updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await newsService.getNewsById(String(req.params.id));
    await newsService.deleteNews(String(req.params.id));
    await createAuditLogFromRequest(req, {
      action: 'deleted',
      resourceType: 'news_article',
      resourceId: article.id,
      resourceTitle: article.title,
    });
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};