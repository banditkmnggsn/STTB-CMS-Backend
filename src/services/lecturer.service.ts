import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';

export const listLecturers = async (activeOnly = true) => {
  return prisma.lecturer.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
};

export const getLecturerById = async (id: string) => {
  const lecturer = await prisma.lecturer.findUnique({ where: { id } });

  if (!lecturer) {
    throw new HttpError(404, 'Lecturer not found');
  }

  return lecturer;
};

export const createLecturer = async (data: {
  name: string;
  position?: string;
  specialization?: string;
  education?: string;
  email?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
}) => {
  return prisma.lecturer.create({
    data: {
      ...data,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
    },
  });
};

export const updateLecturer = async (
  id: string,
  data: {
    name?: string;
    position?: string;
    specialization?: string;
    education?: string;
    email?: string;
    imageUrl?: string;
    order?: number;
    isActive?: boolean;
  }
) => {
  await getLecturerById(id);

  return prisma.lecturer.update({
    where: { id },
    data,
  });
};

export const deleteLecturer = async (id: string) => {
  await getLecturerById(id);
  await prisma.lecturer.delete({ where: { id } });
};