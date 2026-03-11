import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { buildPaginationMeta, paginationSkipTake, parsePagination } from '../utils/pagination';

const SALT_ROUNDS = 10;

const userSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  avatar: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true } },
} as const;

export const listUsers = async (query: Record<string, unknown>) => {
  const params = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.search) {
    where.OR = [
      { name: { contains: String(query.search), mode: 'insensitive' } },
      { email: { contains: String(query.search), mode: 'insensitive' } },
      { username: { contains: String(query.search), mode: 'insensitive' } },
    ];
  }

  if (query.roleId) {
    where.roleId = String(query.roleId);
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true';
  }

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
      ...paginationSkipTake(params),
    }),
  ]);

  return {
    users,
    pagination: buildPaginationMeta(params, total),
  };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
};

export const createUser = async (data: {
  email: string;
  username: string;
  password: string;
  name: string;
  roleId: string;
  isActive?: boolean;
}) => {
  const email = data.email.trim().toLowerCase();
  const username = data.username.trim();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { email: true, username: true },
  });

  if (existing) {
    throw new HttpError(409, existing.email === email ? 'Email already registered' : 'Username already taken');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      name: data.name.trim(),
      roleId: data.roleId,
      isActive: data.isActive ?? true,
    },
    select: userSelect,
  });
};

export const updateUser = async (
  id: string,
  data: {
    email?: string;
    username?: string;
    password?: string;
    name?: string;
    avatar?: string;
    roleId?: string;
    isActive?: boolean;
  }
) => {
  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, username: true } });

  if (!existing) {
    throw new HttpError(404, 'User not found');
  }

  const nextEmail = data.email?.trim().toLowerCase();
  const nextUsername = data.username?.trim();

  if (nextEmail || nextUsername) {
    const duplicate = await prisma.user.findFirst({
      where: {
        id: { not: id },
        OR: [
          ...(nextEmail ? [{ email: nextEmail }] : []),
          ...(nextUsername ? [{ username: nextUsername }] : []),
        ],
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new HttpError(409, 'Email or username already in use');
    }
  }

  return prisma.user.update({
    where: { id },
    data: {
      email: nextEmail,
      username: nextUsername,
      name: data.name?.trim(),
      avatar: data.avatar,
      roleId: data.roleId,
      isActive: data.isActive,
      passwordHash: data.password ? await bcrypt.hash(data.password, SALT_ROUNDS) : undefined,
    },
    select: userSelect,
  });
};

export const deleteUser = async (id: string, requesterId: string) => {
  if (id === requesterId) {
    throw new HttpError(400, 'You cannot delete your own account');
  }

  await getUserById(id);
  await prisma.user.delete({ where: { id } });
};