import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { buildPaginationMeta, paginationSkipTake, parsePagination } from '../utils/pagination';

export const listMedia = async (query: Record<string, unknown>) => {
  const params = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.folder) {
    where.folder = String(query.folder);
  }

  const [total, files] = await prisma.$transaction([
    prisma.mediaFile.count({ where }),
    prisma.mediaFile.findMany({
      where,
      include: { uploader: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      ...paginationSkipTake(params),
    }),
  ]);

  return {
    files,
    pagination: buildPaginationMeta(params, total),
  };
};

export const getMediaById = async (id: string) => {
  const file = await prisma.mediaFile.findUnique({
    where: { id },
    include: { uploader: { select: { id: true, name: true, email: true } } },
  });

  if (!file) {
    throw new HttpError(404, 'Media file not found');
  }

  return file;
};

export const createMediaRecord = async (data: {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  altText?: string;
  title?: string;
  caption?: string;
  description?: string;
  folder?: string;
  uploadedBy?: string;
}) => {
  return prisma.mediaFile.create({ data });
};

export const deleteMedia = async (id: string) => {
  const file = await getMediaById(id);
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
  const absolutePath = path.join(uploadDir, file.filename);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }

  await prisma.mediaFile.delete({ where: { id } });
};