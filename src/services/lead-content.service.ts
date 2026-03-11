import { randomUUID } from 'crypto';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';

export const getLeadContent = async (section: string) => {
  return prisma.leadContent.findFirst({
    where: { section },
    include: { updater: { select: { id: true, name: true, email: true } } },
  });
};

export const upsertLeadContent = async (section: string, data: unknown, userId: string) => {
  const existing = await prisma.leadContent.findFirst({ where: { section } });

  if (existing) {
    return prisma.leadContent.update({
      where: { id: existing.id },
      data: {
        data: data as never,
        updatedBy: userId,
      },
      include: { updater: { select: { id: true, name: true, email: true } } },
    });
  }

  return prisma.leadContent.create({
    data: {
      section,
      data: data as never,
      updatedBy: userId,
    },
    include: { updater: { select: { id: true, name: true, email: true } } },
  });
};

const getProgramsSection = async () => {
  const section = await prisma.leadContent.findFirst({ where: { section: 'programs' } });
  const list = Array.isArray(section?.data) ? [...(section.data as Record<string, unknown>[])] : [];

  return { section, list };
};

export const listLeadPrograms = async () => {
  const { list } = await getProgramsSection();
  return list;
};

export const createLeadProgram = async (program: Record<string, unknown>, userId: string) => {
  const { list } = await getProgramsSection();
  const newProgram = { ...program, id: randomUUID() };

  list.push(newProgram);
  await upsertLeadContent('programs', list, userId);

  return newProgram;
};

export const updateLeadProgram = async (id: string, data: Record<string, unknown>, userId: string) => {
  const { list } = await getProgramsSection();
  const index = list.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new HttpError(404, 'LEAD program not found');
  }

  const nextValue = { ...list[index], ...data };
  list[index] = nextValue;
  await upsertLeadContent('programs', list, userId);

  return nextValue;
};

export const deleteLeadProgram = async (id: string, userId: string) => {
  const { list } = await getProgramsSection();
  const nextList = list.filter((item) => item.id !== id);

  if (nextList.length === list.length) {
    throw new HttpError(404, 'LEAD program not found');
  }

  await upsertLeadContent('programs', nextList, userId);
};