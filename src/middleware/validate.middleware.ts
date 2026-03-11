import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from '../utils/http-error';

export const validateRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(new HttpError(422, 'Validation failed', { errors: errors.array() }));
    return;
  }

  next();
};
