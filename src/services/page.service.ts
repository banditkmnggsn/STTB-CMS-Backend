import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { ensureUniqueSlug, generateSlug } from '../utils/slug';

export const listPages = async () => {
  return prisma.page.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { title: 'asc' },
  });
};

export const getPageBySlug = async (slug: string) => {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { updater: { select: { id: true, name: true, email: true } } },
  });

  if (!page) {
    throw new HttpError(404, 'Page not found');
  }

  return page;
};

export const createPage = async (
  data: { title: string; data: unknown; isActive?: boolean },
  userId: string
) => {
  const baseSlug = generateSlug(data.title);
  const slug = await ensureUniqueSlug(
    baseSlug,
    async (candidate) => Boolean(await prisma.page.findUnique({ where: { slug: candidate } }))
  );

  return prisma.page.create({
    data: {
      slug,
      title: data.title,
      data: data.data as never,
      isActive: data.isActive ?? true,
      updatedBy: userId,
    },
  });
};

export const updatePage = async (
  slug: string,
  data: { title?: string; data?: unknown; isActive?: boolean },
  userId: string
) => {
  await getPageBySlug(slug);

  return prisma.page.update({
    where: { slug },
    data: {
      title: data.title,
      ...(data.data !== undefined ? { data: data.data as never } : {}),
      isActive: data.isActive,
      updatedBy: userId,
    },
  });
};

export const deletePage = async (slug: string) => {
  await getPageBySlug(slug);
  await prisma.page.delete({ where: { slug } });
};