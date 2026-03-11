import { NextFunction, Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { sendCreated, sendDeleted, sendSuccess } from '../utils/api-response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.listCategories(req.query.parentId as string | undefined);
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.getCategoryById(String(req.params.id));
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.createCategory(req.body);
    sendCreated(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.updateCategory(String(req.params.id), req.body);
    sendSuccess(res, category, 200, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoryService.deleteCategory(String(req.params.id));
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};