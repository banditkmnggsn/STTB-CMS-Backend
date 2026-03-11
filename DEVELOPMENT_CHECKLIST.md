# STTB Backend Development Checklist

Last update: 2026-03-11

## Phase 1: Setup & Database Configuration
- [x] Initialize Node.js backend project (`npm init`)
- [x] Install core dependencies (Express, Prisma, etc.)
- [x] Initialize TypeScript configuration
- [x] Setup Prisma ORM and `.env` for PostgreSQL connection
- [x] Create `schema.prisma` with required tables
- [x] Run Prisma migration and sync database schema

Status: Completed

## Phase 2: Core API & Authentication
- [x] Implement user authentication (Registration, Login, JWT tokens)
- [x] Implement middleware for role-based permissions (basic RBAC)
- [ ] Add request validation and auth hardening (token rotation, logout flow)
- [ ] Seed default roles and bootstrap first admin user

Status: In Progress

## Phase 3: Content Endpoints (CMS API)
- [ ] Homepage content API
- [ ] LEAD content API
- [ ] Programs API
- [ ] News/Articles API
- [ ] Site settings API
- [ ] Audit logs API

Status: Not Started

## Phase 4: Media Upload & Management
- [ ] Implement file upload using Multer for local/S3 storage

Status: Not Started

## Phase 5: Integration & Testing
- [ ] Connect with frontend integration flow
- [ ] Add testing and finalization checklist

Status: Not Started

## Notes
- Current DB migration status: `2 migrations found`, schema `up to date`.
- Auth endpoints currently available:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
  - `GET /api/auth/admin-only`
