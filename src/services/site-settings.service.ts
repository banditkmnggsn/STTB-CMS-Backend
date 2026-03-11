import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';

export const getAllSettings = async () => {
  const settings = await prisma.siteSetting.findMany({
    include: { updater: { select: { id: true, name: true, email: true } } },
    orderBy: { category: 'asc' },
  });

  return settings.reduce<Record<string, unknown>>((accumulator, item) => {
    accumulator[item.category] = item.data;
    return accumulator;
  }, {});
};

export const getSettingByCategory = async (category: string) => {
  const setting = await prisma.siteSetting.findUnique({
    where: { category },
    include: { updater: { select: { id: true, name: true, email: true } } },
  });

  if (!setting) {
    throw new HttpError(404, `Settings category '${category}' not found`);
  }

  return setting;
};

export const upsertSetting = async (category: string, data: unknown, userId: string) => {
  const existing = await prisma.siteSetting.findUnique({ where: { category } });

  if (existing) {
    return prisma.siteSetting.update({
      where: { category },
      data: {
        data: data as never,
        updatedBy: userId,
      },
      include: { updater: { select: { id: true, name: true, email: true } } },
    });
  }

  return prisma.siteSetting.create({
    data: {
      category,
      data: data as never,
      updatedBy: userId,
    },
    include: { updater: { select: { id: true, name: true, email: true } } },
  });
};