import { NextFunction, Request, Response } from 'express';
import { createAuditLogFromRequest } from '../services/audit-log.service';
import * as eventService from '../services/event.service';
import { sendCreated, sendDeleted, sendPaginated, sendSuccess } from '../utils/api-response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { events, pagination } = await eventService.listEvents(req.query as Record<string, unknown>);
    sendPaginated(res, events, pagination);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.getEventById(String(req.params.id));
    sendSuccess(res, event);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.createEvent(req.body);
    await createAuditLogFromRequest(req, {
      action: 'created',
      resourceType: 'event',
      resourceId: event.id,
      resourceTitle: event.title,
    });
    sendCreated(res, event, 'Event created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.updateEvent(String(req.params.id), req.body);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'event',
      resourceId: event.id,
      resourceTitle: event.title,
    });
    sendSuccess(res, event, 200, 'Event updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await eventService.deleteEvent(String(req.params.id));
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};