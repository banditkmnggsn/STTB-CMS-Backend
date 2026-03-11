import { NextFunction, Request, Response } from 'express';
import { listAuditLogs } from '../services/audit-log.service';
import { sendPaginated } from '../utils/api-response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { logs, pagination } = await listAuditLogs(req.query as Record<string, unknown>);
    sendPaginated(res, logs, pagination);
  } catch (error) {
    next(error);
  }
};