import { Request } from 'express';
import { prisma } from '../config/prisma';

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
