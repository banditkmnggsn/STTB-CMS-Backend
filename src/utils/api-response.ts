import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  statusCode = 200,
  message = 'Operation successful'
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = (res: Response, data: unknown, message = 'Resource created successfully'): Response =>
  sendSuccess(res, data, 201, message);

export const sendDeleted = (res: Response): Response =>
  res.status(204).send();

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const sendPaginated = (
  res: Response,
  items: unknown[],
  meta: PaginationMeta,
  message = 'Operation successful'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data: { items, pagination: meta },
  });
};
