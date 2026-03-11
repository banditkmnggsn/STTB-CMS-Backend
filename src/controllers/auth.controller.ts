import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { createAuditLogFromRequest } from '../services/audit-log.service';
import { HttpError } from '../utils/http-error';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      roleName: req.body.roleName,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login({
      identifier: req.body.identifier,
      password: req.body.password,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, 'Unauthorized');
    }

    const profile = await authService.getMyProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createAuditLogFromRequest(req, {
      action: 'logout',
      resourceType: 'auth',
      resourceTitle: req.user?.email,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
