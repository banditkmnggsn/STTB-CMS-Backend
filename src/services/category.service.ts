import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { ensureUniqueSlug, generateSlug } from '../utils/slug';

export const listCategories = async (parentId?: string) => {
  const where: Record<string, unknown> = {};

  if (parentId === 'null') {
    where.parentId = null;
  } else if (parentId) {
    where.parentId = parentId;
  }

  return prisma.category.findMany({
    where,
    include: {
      children: {
        select: { id: true, name: true, slug: true, color: true, orderIndex: true },
        orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      },
      parent: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
  });
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      children: {
        select: { id: true, name: true, slug: true, color: true, orderIndex: true },
        orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      },
      parent: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!category) {
    throw new HttpError(404, 'Category not found');
  }

  return category;
};

export const createCategory = async (data: {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  orderIndex?: number;
}) => {
  const baseSlug = generateSlug(data.name);
  const slug = await ensureUniqueSlug(
    baseSlug,
    async (candidate) => Boolean(await prisma.category.findUnique({ where: { slug: candidate } }))
  );

  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      parentId: data.parentId,
      color: data.color,
      orderIndex: data.orderIndex ?? 0,
    },
  });
};

export const updateCategory = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    parentId?: string | null;
    color?: string;
    orderIndex?: number;
  }
) => {
  await getCategoryById(id);

  return prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      color: data.color,
      orderIndex: data.orderIndex,
    },
  });
};

export const deleteCategory = async (id: string) => {
  await getCategoryById(id);

  const articleCount = await prisma.newsArticle.count({ where: { categoryId: id } });
  if (articleCount > 0) {
    throw new HttpError(400, `Cannot delete category with ${articleCount} related article(s)`);
  }

  await prisma.category.delete({ where: { id } });
};