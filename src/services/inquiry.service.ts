import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { buildPaginationMeta, paginationSkipTake, parsePagination } from '../utils/pagination';

export const listInquiries = async (query: Record<string, unknown>) => {
  const params = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.isRead !== undefined) {
    where.isRead = query.isRead === 'true';
  }

  const [total, inquiries] = await prisma.$transaction([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationSkipTake(params),
    }),
  ]);

  return {
    inquiries,
    pagination: buildPaginationMeta(params, total),
  };
};

export const createInquiry = async (data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) => {
  return prisma.inquiry.create({ data });
};

export const markInquiryAsRead = async (id: string) => {
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });

  if (!inquiry) {
    throw new HttpError(404, 'Inquiry not found');
  }

  return prisma.inquiry.update({
    where: { id },
    data: { isRead: true },
  });
};

export const deleteInquiry = async (id: string) => {
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });

  if (!inquiry) {
    throw new HttpError(404, 'Inquiry not found');
  }

  await prisma.inquiry.delete({ where: { id } });
};