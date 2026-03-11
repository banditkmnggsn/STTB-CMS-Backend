import { NextFunction, Request, Response } from 'express';
import * as inquiryService from '../services/inquiry.service';
import { sendCreated, sendDeleted, sendPaginated, sendSuccess } from '../utils/api-response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inquiries, pagination } = await inquiryService.listInquiries(req.query as Record<string, unknown>);
    sendPaginated(res, inquiries, pagination);
  } catch (error) {
    next(error);
  }
};

export const submit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);
    sendCreated(res, inquiry, 'Inquiry submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inquiry = await inquiryService.markInquiryAsRead(String(req.params.id));
    sendSuccess(res, inquiry, 200, 'Inquiry marked as read');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await inquiryService.deleteInquiry(String(req.params.id));
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};