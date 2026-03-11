import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

interface RegisterInput {
  email: string;
  username: string;
  password: string;
  name: string;
  roleName?: string;
}

interface LoginInput {
  identifier: string;
  password: string;
}

const SALT_ROUNDS = 10;

const sanitizeUser = (user: {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string | null;
  isActive: boolean;
  role: { id: string; name: string };
}) => {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    isActive: user.isActive,
    role: user.role,
  };
};

const issueTokens = (user: {
  id: string;
  email: string;
  username: string;
  name: string;
  role: { name: string };
}) => {
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role.name,
    name: user.name,
  };

  return {
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
};

export const register = async (input: RegisterInput) => {
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim();
  const name = input.name.trim();

  if (!email || !username || !name || !input.password) {
    throw new HttpError(400, 'Email, username, name, and password are required');
  }

  if (input.password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters');
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { id: true, email: true, username: true },
  });

  if (existing) {
    if (existing.email === email) {
      throw new HttpError(409, 'Email is already registered');
    }
    throw new HttpError(409, 'Username is already taken');
  }

  const role = input.roleName
    ? await prisma.role.findUnique({ where: { name: input.roleName } })
    : await prisma.role.findFirst({ orderBy: { createdAt: 'asc' } });

  if (!role) {
    throw new HttpError(500, 'No role found. Please seed roles before registering users');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      name,
      passwordHash,
      roleId: role.id,
    },
    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const tokens = issueTokens({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: { name: user.role.name },
  });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

export const login = async (input: LoginInput) => {
  const identifier = input.identifier.trim();
  const password = input.password;

  if (!identifier || !password) {
    throw new HttpError(400, 'Identifier and password are required');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
    },
    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw new HttpError(403, 'Account is inactive');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new HttpError(401, 'Invalid credentials');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const tokens = issueTokens({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: { name: user.role.name },
  });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

export const refresh = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new HttpError(400, 'Refresh token is required');
  }

  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new HttpError(401, 'Invalid refresh token subject');
  }

  return {
    ...issueTokens({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: { name: user.role.name },
    }),
  };
};

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          permissions: true,
        },
      },
    },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    role: user.role,
  };
};
