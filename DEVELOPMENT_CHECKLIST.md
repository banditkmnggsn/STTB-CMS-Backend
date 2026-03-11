# STTB Backend Development Checklist

Last update: 2026-03-12

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
- [x] Add request validation middleware (express-validator + validateRequest)
- [x] Add reusable response helpers (sendSuccess, sendCreated, sendDeleted, sendPaginated)
- [x] Add pagination utilities (parsePagination, buildPaginationMeta)
- [x] Add slug generator utility
- [x] Add audit log service (with request-based helper)
- [x] Add upload middleware (image + document filtering)
- [x] Add Prisma pg adapter (Prisma 7 compatible)
- [x] Seed default roles (admin/editor/author) + first admin user

Status: Completed

## Phase 3: Content Endpoints (CMS API)
- [x] Homepage content API
- [x] LEAD content API
- [x] Programs API
- [x] News/Articles API
- [x] Categories API
- [x] Tags API
- [x] Events API
- [x] Site settings API
- [x] Audit logs API
- [x] Users API
- [x] Roles API
- [x] Lecturers API
- [x] Inquiries API
- [x] Pages API
- [x] Auth logout API

Status: Completed

## Phase 4: Media Upload & Management
- [x] Implement file upload using Multer for local storage
- [x] Add media CRUD endpoints (list, detail, upload, delete)

Status: Completed

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
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `GET /api/auth/admin-only`
- Content endpoints available:
  - `GET/POST/PUT/DELETE /api/categories`
  - `GET/POST/PUT/DELETE /api/tags`
  - `GET/POST/PUT/DELETE /api/news`
  - `GET/PUT /api/home-content/:section`
  - `GET/PUT /api/programs/:slug`
  - `POST/DELETE /api/programs/:slug/courses`
  - `GET/PUT /api/lead-content/:section`
  - `GET/POST/PUT/DELETE /api/lead-content/programs`
  - `GET/POST/PUT/DELETE /api/events`
  - `GET/PUT /api/site-settings/:category`
  - `GET/POST/PUT/DELETE /api/media`
  - `GET/POST/PUT/DELETE /api/users`
  - `GET/POST/PUT /api/roles`
  - `GET /api/audit-logs`
  - `GET/POST/PUT/DELETE /api/lecturers`
  - `POST /api/inquiries`, `GET /api/inquiries`, `PUT /api/inquiries/:id/read`, `DELETE /api/inquiries/:id`
  - `GET/POST/PUT/DELETE /api/pages`
