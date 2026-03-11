import { randomUUID } from 'crypto';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';

export const listPrograms = async (activeOnly = true) => {
  return prisma.program.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    select: {
      id: true,
      slug: true,
      title: true,
      degree: true,
      shortDescription: true,
      heroImage: true,
      isActive: true,
      updatedAt: true,
    },
    orderBy: { title: 'asc' },
  });
};

export const getProgramBySlug = async (slug: string) => {
  const program = await prisma.program.findUnique({
    where: { slug },
    include: { updater: { select: { id: true, name: true, email: true } } },
  });

  if (!program) {
    throw new HttpError(404, 'Program not found');
  }

  return program;
};

export const updateProgram = async (
  slug: string,
  data: {
    title?: string;
    degree?: string;
    shortDescription?: string;
    heroImage?: string;
    heroDescription?: string;
    ctaTitle?: string;
    ctaDescription?: string;
    isActive?: boolean;
    seoTitle?: string;
    seoDescription?: string;
  },
  userId: string
) => {
  const program = await getProgramBySlug(slug);

  return prisma.program.update({
    where: { id: program.id },
    data: {
      ...data,
      updatedBy: userId,
    },
  });
};

export const updateAcademicInfo = async (slug: string, academicInfo: unknown, userId: string) => {
  const program = await getProgramBySlug(slug);

  return prisma.program.update({
    where: { id: program.id },
    data: {
      academicInfo: academicInfo as never,
      updatedBy: userId,
    },
  });
};

export const updateCurriculumCategories = async (slug: string, categories: unknown, userId: string) => {
  const program = await getProgramBySlug(slug);

  return prisma.program.update({
    where: { id: program.id },
    data: {
      curriculumCategories: categories as never,
      updatedBy: userId,
    },
  });
};

export const updateGraduateProfile = async (slug: string, graduateProfile: unknown, userId: string) => {
  const program = await getProgramBySlug(slug);

  return prisma.program.update({
    where: { id: program.id },
    data: {
      graduateProfile: graduateProfile as never,
      updatedBy: userId,
    },
  });
};

export const updateCareerOpportunities = async (
  slug: string,
  careerOpportunities: unknown,
  userId: string
) => {
  const program = await getProgramBySlug(slug);

  return prisma.program.update({
    where: { id: program.id },
    data: {
      careerOpportunities: careerOpportunities as never,
      updatedBy: userId,
    },
  });
};

export const addCourse = async (slug: string, course: Record<string, unknown>, userId: string) => {
  const program = await getProgramBySlug(slug);
  const courses = Array.isArray(program.courses) ? [...(program.courses as Record<string, unknown>[])] : [];
  const newCourse = { ...course, id: randomUUID() };

  courses.push(newCourse);

  await prisma.program.update({
    where: { id: program.id },
    data: {
      courses: courses as never,
      updatedBy: userId,
    },
  });

  return newCourse;
};

export const deleteCourse = async (slug: string, courseId: string, userId: string) => {
  const program = await getProgramBySlug(slug);
  const courses = Array.isArray(program.courses) ? [...(program.courses as Record<string, unknown>[])] : [];
  const nextCourses = courses.filter((course) => course.id !== courseId);

  if (nextCourses.length === courses.length) {
    throw new HttpError(404, 'Course not found');
  }

  await prisma.program.update({
    where: { id: program.id },
    data: {
      courses: nextCourses as never,
      updatedBy: userId,
    },
  });
};