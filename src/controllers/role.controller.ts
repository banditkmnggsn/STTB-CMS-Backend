import { NextFunction, Request, Response } from 'express';
import * as roleService from '../services/role.service';
import { sendCreated, sendSuccess } from '../utils/api-response';

export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await roleService.listRoles();
    sendSuccess(res, roles);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleService.getRoleById(String(req.params.id));
    sendSuccess(res, role);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleService.createRole(req.body);
    sendCreated(res, role, 'Role created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleService.updateRole(String(req.params.id), req.body);
    sendSuccess(res, role, 200, 'Role updated successfully');
  } catch (error) {
    next(error);
  }
};