import { NextFunction, Request, Response } from 'express';
import * as mediaService from '../services/media.service';
import { sendCreated, sendDeleted, sendPaginated, sendSuccess } from '../utils/api-response';
import { HttpError } from '../utils/http-error';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { files, pagination } = await mediaService.listMedia(req.query as Record<string, unknown>);
    sendPaginated(res, files, pagination);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await mediaService.getMediaById(String(req.params.id));
    sendSuccess(res, file);
  } catch (error) {
    next(error);
  }
};

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new HttpError(400, 'No file uploaded');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const folder = req.body.folder || 'general';
    const record = await mediaService.createMediaRecord({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `${baseUrl}/uploads/${req.file.filename}`,
      altText: req.body.alt,
      title: req.body.title,
      caption: req.body.caption,
      description: req.body.description,
      folder,
      uploadedBy: req.user?.id,
    });

    sendCreated(res, record, 'File uploaded successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await mediaService.deleteMedia(String(req.params.id));
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};