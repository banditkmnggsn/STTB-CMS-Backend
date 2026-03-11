import { prisma } from '../config/prisma';

export const getHomeContent = async (section: string) => {
  return prisma.homeContent.findFirst({
    where: { section },
    include: { updater: { select: { id: true, name: true, email: true } } },
  });
};

export const upsertHomeContent = async (section: string, data: unknown, userId: string) => {
  const existing = await prisma.homeContent.findFirst({ where: { section } });

  if (existing) {
    return prisma.homeContent.update({
      where: { id: existing.id },
      data: {
        data: data as never,
        updatedBy: userId,
      },
      include: { updater: { select: { id: true, name: true, email: true } } },
    });
  }

  return prisma.homeContent.create({
    data: {
      section,
      data: data as never,
      updatedBy: userId,
    },
    include: { updater: { select: { id: true, name: true, email: true } } },
  });
};