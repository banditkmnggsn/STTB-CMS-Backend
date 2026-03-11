import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, log: ['error'] });

const SALT_ROUNDS = 10;

async function main() {
  console.log('Seeding roles...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Super Administrator — full access to all CMS features',
      isSystem: true,
      permissions: {
        users: ['create', 'read', 'update', 'delete'],
        roles: ['create', 'read', 'update', 'delete'],
        articles: ['create', 'read', 'update', 'delete', 'publish'],
        programs: ['create', 'read', 'update', 'delete'],
        events: ['create', 'read', 'update', 'delete'],
        media: ['create', 'read', 'update', 'delete'],
        homeContent: ['read', 'update'],
        leadContent: ['read', 'update'],
        pages: ['create', 'read', 'update', 'delete'],
        lecturers: ['create', 'read', 'update', 'delete'],
        categories: ['create', 'read', 'update', 'delete'],
        tags: ['create', 'read', 'update', 'delete'],
        siteSettings: ['read', 'update'],
        auditLogs: ['read'],
        inquiries: ['read', 'delete'],
      },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: {
      name: 'editor',
      description: 'Editor — manages and publishes content',
      isSystem: true,
      permissions: {
        articles: ['create', 'read', 'update', 'publish'],
        programs: ['read', 'update'],
        events: ['create', 'read', 'update'],
        media: ['create', 'read', 'update'],
        homeContent: ['read', 'update'],
        leadContent: ['read', 'update'],
        pages: ['read', 'update'],
        lecturers: ['read', 'update'],
        categories: ['read'],
        tags: ['create', 'read'],
      },
    },
  });

  const authorRole = await prisma.role.upsert({
    where: { name: 'author' },
    update: {},
    create: {
      name: 'author',
      description: 'Author — creates content as drafts for editor review',
      isSystem: true,
      permissions: {
        articles: ['create', 'read', 'update'],
        media: ['create', 'read'],
        categories: ['read'],
        tags: ['create', 'read'],
      },
    },
  });

  console.log(`Roles seeded: ${adminRole.name}, ${editorRole.name}, ${authorRole.name}`);

  // Bootstrap first admin user (skip if already exists)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sttb.ac.id';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2026!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'admin',
        name: 'Administrator',
        passwordHash,
        roleId: adminRole.id,
      },
    });

    console.log(`Admin user created: ${adminUser.email}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}, skipping.`);
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
