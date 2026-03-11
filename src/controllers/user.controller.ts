import { NextFunction, Request, Response } from 'express';
import { createAuditLogFromRequest } from '../services/audit-log.service';
import * as userService from '../services/user.service';
import { sendCreated, sendDeleted, sendPaginated, sendSuccess } from '../utils/api-response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { users, pagination } = await userService.listUsers(req.query as Record<string, unknown>);
    sendPaginated(res, users, pagination);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(String(req.params.id));
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createUser(req.body);
    await createAuditLogFromRequest(req, {
      action: 'created',
      resourceType: 'user',
      resourceId: user.id,
      resourceTitle: user.name,
    });
    sendCreated(res, user, 'User created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateUser(String(req.params.id), req.body);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'user',
      resourceId: user.id,
      resourceTitle: user.name,
    });
    sendSuccess(res, user, 200, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = String(req.params.id);
    await userService.deleteUser(userId, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'deleted',
      resourceType: 'user',
      resourceId: userId,
      resourceTitle: userId,
    });
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};