import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';

export const listRoles = async () => {
  return prisma.role.findMany({ orderBy: { name: 'asc' } });
};

export const getRoleById = async (id: string) => {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new HttpError(404, 'Role not found');
  }

  return role;
};

export const createRole = async (data: { name: string; description?: string; permissions: unknown }) => {
  const existing = await prisma.role.findUnique({ where: { name: data.name.trim() } });

  if (existing) {
    throw new HttpError(409, 'Role name already exists');
  }

  return prisma.role.create({
    data: {
      name: data.name.trim(),
      description: data.description,
      permissions: data.permissions as never,
    },
  });
};

export const updateRole = async (
  id: string,
  data: { name?: string; description?: string; permissions?: unknown }
) => {
  const role = await getRoleById(id);

  if (role.isSystem && data.name && data.name.trim() !== role.name) {
    throw new HttpError(400, 'System roles cannot be renamed');
  }

  return prisma.role.update({
    where: { id },
    data: {
      name: data.name?.trim(),
      description: data.description,
      ...(data.permissions !== undefined ? { permissions: data.permissions as never } : {}),
    },
  });
};