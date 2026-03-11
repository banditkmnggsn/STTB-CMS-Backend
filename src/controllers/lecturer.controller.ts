import { NextFunction, Request, Response } from 'express';
import * as lecturerService from '../services/lecturer.service';
import { sendCreated, sendDeleted, sendSuccess } from '../utils/api-response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lecturers = await lecturerService.listLecturers(req.query.all !== 'true');
    sendSuccess(res, lecturers);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lecturer = await lecturerService.getLecturerById(String(req.params.id));
    sendSuccess(res, lecturer);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lecturer = await lecturerService.createLecturer(req.body);
    sendCreated(res, lecturer, 'Lecturer created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lecturer = await lecturerService.updateLecturer(String(req.params.id), req.body);
    sendSuccess(res, lecturer, 200, 'Lecturer updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await lecturerService.deleteLecturer(String(req.params.id));
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};