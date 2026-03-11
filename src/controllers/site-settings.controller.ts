import { NextFunction, Request, Response } from 'express';
import { createAuditLogFromRequest } from '../services/audit-log.service';
import * as siteSettingsService from '../services/site-settings.service';
import { sendSuccess } from '../utils/api-response';

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await siteSettingsService.getAllSettings();
    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
};

export const getByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await siteSettingsService.getSettingByCategory(String(req.params.category));
    sendSuccess(res, setting);
  } catch (error) {
    next(error);
  }
};

export const upsert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = String(req.params.category);
    const setting = await siteSettingsService.upsertSetting(category, req.body, req.user!.id);
    await createAuditLogFromRequest(req, {
      action: 'updated',
      resourceType: 'site_setting',
      resourceId: setting.id,
      resourceTitle: setting.category,
    });
    sendSuccess(res, setting, 200, `Settings '${category}' updated successfully`);
  } catch (error) {
    next(error);
  }
};