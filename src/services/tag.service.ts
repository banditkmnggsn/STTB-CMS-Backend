import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { ensureUniqueSlug, generateSlug } from '../utils/slug';

export const listTags = async () => {
  return prisma.tag.findMany({ orderBy: { name: 'asc' } });
};

export const getTagById = async (id: string) => {
  const tag = await prisma.tag.findUnique({ where: { id } });

  if (!tag) {
    throw new HttpError(404, 'Tag not found');
  }

  return tag;
};

export const createTag = async (name: string) => {
  const normalizedName = name.trim();
  const baseSlug = generateSlug(normalizedName);
  const slug = await ensureUniqueSlug(
    baseSlug,
    async (candidate) => Boolean(await prisma.tag.findUnique({ where: { slug: candidate } }))
  );

  return prisma.tag.create({
    data: {
      name: normalizedName,
      slug,
    },
  });
};

export const updateTag = async (id: string, name: string) => {
  await getTagById(id);

  return prisma.tag.update({
    where: { id },
    data: { name: name.trim() },
  });
};

export const deleteTag = async (id: string) => {
  await getTagById(id);
  await prisma.tag.delete({ where: { id } });
};