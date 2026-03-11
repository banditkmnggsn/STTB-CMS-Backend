import { Request } from 'express';
import { prisma } from '../config/prisma';
import { buildPaginationMeta, paginationSkipTake, parsePagination } from '../utils/pagination';

export interface AuditInput {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceTitle?: string;
  changes?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (input: AuditInput): Promise<void> => {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      resourceTitle: input.resourceTitle,
      changes: input.changes as never,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
};

export const createAuditLogFromRequest = async (
  req: Request,
  input: Omit<AuditInput, 'userId' | 'ipAddress' | 'userAgent'>
): Promise<void> => {
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim()
    ?? req.socket.remoteAddress;

  await createAuditLog({
    ...input,
    userId: req.user?.id,
    ipAddress,
    userAgent: req.headers['user-agent'],
  });
};

export const listAuditLogs = async (query: Record<string, unknown>) => {
  const params = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.userId) {
    where.userId = String(query.userId);
  }

  if (query.action) {
    where.action = String(query.action);
  }

  if (query.resourceType) {
    where.resourceType = String(query.resourceType);
  }

  const [total, logs] = await prisma.$transaction([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      ...paginationSkipTake(params),
    }),
  ]);

  return {
    logs,
    pagination: buildPaginationMeta(params, total),
  };
};
