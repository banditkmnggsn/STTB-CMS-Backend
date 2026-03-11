import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error';
import { verifyAccessToken } from '../utils/jwt';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new HttpError(401, 'Missing or invalid Authorization header'));
    return;
  }

  const token = authorization.split(' ')[1];
  const payload = verifyAccessToken(token);

  req.user = {
    id: payload.sub,
    email: payload.email,
    username: payload.username,
    role: payload.role,
    name: payload.name,
  };

  next();
};
