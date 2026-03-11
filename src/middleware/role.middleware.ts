import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new HttpError(401, 'Unauthorized'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new HttpError(403, 'Forbidden: insufficient role permissions'));
      return;
    }

    next();
  };
};
