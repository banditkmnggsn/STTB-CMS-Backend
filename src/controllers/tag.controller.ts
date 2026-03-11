import { NextFunction, Request, Response } from 'express';
import * as tagService from '../services/tag.service';
import { sendCreated, sendDeleted, sendSuccess } from '../utils/api-response';

export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await tagService.listTags();
    sendSuccess(res, tags);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await tagService.getTagById(String(req.params.id));
    sendSuccess(res, tag);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await tagService.createTag(req.body.name);
    sendCreated(res, tag, 'Tag created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await tagService.updateTag(String(req.params.id), req.body.name);
    sendSuccess(res, tag, 200, 'Tag updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await tagService.deleteTag(String(req.params.id));
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};