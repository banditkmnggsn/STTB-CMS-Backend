# STTB Frontend API Integration Guide

Last update: 2026-03-12
Project: STTB Backend API
Purpose: Dokumen handoff untuk frontend React/Next.js atau AI builder dari Figma agar bisa langsung menghubungkan UI ke backend ini.

## 1. Ringkasan

Backend ini sudah menyediakan API utama untuk CMS STTB dan siap diintegrasikan ke frontend terpisah.

Frontend yang akan memakai API ini diasumsikan:

- berupa code React atau Next.js
- mengambil data publik untuk halaman website
- mengambil data protected untuk admin CMS
- menggunakan Bearer token untuk endpoint yang memerlukan login

Dokumen ini fokus pada:

- base URL
- pola auth
- daftar endpoint
- request dan response pattern
- endpoint public vs admin
- struktur data yang perlu diperhatikan frontend

## 2. Stack Backend

- Node.js
- TypeScript
- Express 5
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer upload middleware

## 3. Base URL

Saat development lokal, gunakan base URL seperti:

```txt
http://localhost:3000
```

Semua endpoint berada di bawah prefix:

```txt
/api
```

Contoh:

```txt
GET http://localhost:3000/api/news
GET http://localhost:3000/api/home-content/hero
POST http://localhost:3000/api/auth/login
```

## 4. Health Check

Endpoint:

```txt
GET /api/health
```

Contoh response:

```json
{
  "status": "ok",
  "message": "STTB API is running",
  "timestamp": "2026-03-12T10:00:00.000Z"
}
```

## 5. Authentication Model

### 5.1 Login flow

Frontend admin login ke endpoint:

```txt
POST /api/auth/login
```

Request body:

```json
{
  "identifier": "admin@sttb.ac.id",
  "password": "Admin@2026!"
}
```

Response pattern:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@sttb.ac.id",
      "username": "admin",
      "name": "Administrator",
      "avatar": null,
      "isActive": true,
      "role": {
        "id": "uuid",
        "name": "admin"
      }
    },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### 5.2 Auth header

Untuk endpoint protected, frontend harus mengirim header:

```txt
Authorization: Bearer <accessToken>
```

### 5.3 Endpoint auth tersedia

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/admin-only`

### 5.4 Role access

Role yang saat ini dipakai backend:

- `admin`
- `editor`
- `author`

Secara umum:

- public endpoint: tidak butuh token
- content management write endpoint: biasanya butuh `admin` atau `editor`
- system endpoint seperti users, roles, audit: butuh `admin`

## 6. Response Pattern Global

### 6.1 Success response umum

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### 6.2 Paginated response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

Catatan penting:

- beberapa list endpoint mengembalikan `items`
- frontend jangan mengasumsikan key seperti `articles`, `users`, `logs` di outer response
- ambil data list dari `data.items`
- ambil metadata halaman dari `data.pagination`

### 6.3 Error response

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "errors": [
      {
        "type": "field",
        "path": "title",
        "msg": "Title is required",
        "location": "body"
      }
    ]
  }
}
```

## 7. Query Parameter Convention

List endpoint yang mendukung pagination memakai pola:

```txt
?page=1&limit=10
```

Limit maksimum saat ini di backend:

```txt
100
```

## 8. Public Website Endpoints

Bagian ini dipakai oleh halaman publik website.

### 8.1 Home Content

Endpoint:

- `GET /api/home-content/:section`

Section yang umum dipakai frontend:

- `hero`
- `stats`
- `showcase`
- `facilities`
- `cta`

Contoh:

```txt
GET /api/home-content/hero
GET /api/home-content/stats
```

Response `data` adalah row `home_content`, dan konten utama ada di field:

```txt
data.data
```

Artinya frontend biasanya akan membaca:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "section": "hero",
    "data": {
      "title": "...",
      "subtitle": "..."
    },
    "isActive": true,
    "updatedAt": "..."
  }
}
```

### 8.2 Programs

Endpoint:

- `GET /api/programs`
- `GET /api/programs/:slug`

Contoh:

```txt
GET /api/programs
GET /api/programs/sarjana-teologi
```

Frontend program detail perlu membaca field penting berikut dari `data`:

- `title`
- `degree`
- `shortDescription`
- `heroImage`
- `heroDescription`
- `academicInfo`
- `curriculumCategories`
- `courses`
- `graduateProfile`
- `careerOpportunities`
- `concentrations`
- `ctaTitle`
- `ctaDescription`
- `seoTitle`
- `seoDescription`

Catatan:

- beberapa field berupa JSON object atau JSON array
- frontend harus siap jika field bernilai `null`

### 8.3 LEAD Content

Endpoint publik:

- `GET /api/lead-content/:section`
- `GET /api/lead-content/programs`

Section yang umum dipakai:

- `hero`
- `pillars`
- `programs`
- `events`

### 8.4 Events

Endpoint:

- `GET /api/events`
- `GET /api/events/:id`

Contoh filter query:

```txt
/api/events?upcoming=true&page=1&limit=10
/api/events?isLeadEvent=true
/api/events?featured=true
```

### 8.5 News / Articles

Endpoint:

- `GET /api/news`
- `GET /api/news/:slug`

Contoh query yang didukung:

```txt
/api/news?page=1&limit=10
/api/news?status=published
/api/news?type=article
/api/news?category=akademik
/api/news?search=seminar
/api/news?featured=true
/api/news?sort=views
```

Field penting article detail:

- `id`
- `slug`
- `title`
- `excerpt`
- `content`
- `featuredImage`
- `category`
- `author`
- `tags`
- `status`
- `type`
- `mediaUrl`
- `duration`
- `isFeatured`
- `publishDate`
- `views`

### 8.6 Lecturers

Endpoint:

- `GET /api/lecturers`
- `GET /api/lecturers/:id`

Dipakai untuk halaman dosen atau dewan pengajar.

### 8.7 Pages

Endpoint:

- `GET /api/pages`
- `GET /api/pages/:slug`

Dipakai untuk page builder universal atau halaman statis dinamis.

### 8.8 Site Settings

Endpoint:

- `GET /api/site-settings`
- `GET /api/site-settings/:category`

Kategori yang umum untuk frontend:

- `general`
- `contact`
- `banking`
- `social`
- `seo`

### 8.9 Inquiries / Contact Form

Endpoint public:

- `POST /api/inquiries`

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Pertanyaan admisi",
  "message": "Saya ingin bertanya soal pendaftaran"
}
```

## 9. Admin CMS Endpoints

Bagian ini dipakai oleh dashboard admin.

### 9.1 Categories

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### 9.2 Tags

- `GET /api/tags`
- `GET /api/tags/:id`
- `POST /api/tags`
- `PUT /api/tags/:id`
- `DELETE /api/tags/:id`

### 9.3 News Admin

- `POST /api/news`
- `PUT /api/news/:id`
- `DELETE /api/news/:id`

Contoh request create article:

```json
{
  "title": "Seminar Nasional Teologi",
  "excerpt": "Ringkasan singkat artikel",
  "content": "<p>Isi artikel HTML</p>",
  "featuredImage": "https://...",
  "categoryId": "uuid",
  "tags": ["uuid-tag-1", "uuid-tag-2"],
  "status": "draft",
  "type": "article",
  "publishDate": "2026-03-20T10:00:00.000Z",
  "isFeatured": false,
  "mediaUrl": null,
  "duration": null
}
```

### 9.4 Home Content Admin

- `PUT /api/home-content/:section`

Admin mengirim object JSON langsung sesuai kebutuhan frontend section tersebut.

Contoh:

```json
{
  "title": "Membentuk Pemimpin Rohani Masa Depan",
  "subtitle": "STTB Bandung",
  "description": "..."
}
```

### 9.5 Programs Admin

- `PUT /api/programs/:slug`
- `PUT /api/programs/:slug/academic-info`
- `PUT /api/programs/:slug/curriculum`
- `PUT /api/programs/:slug/graduate-profile`
- `PUT /api/programs/:slug/career-opportunities`
- `POST /api/programs/:slug/courses`
- `DELETE /api/programs/:slug/courses/:courseId`

### 9.6 LEAD Admin

- `PUT /api/lead-content/:section`
- `POST /api/lead-content/programs`
- `PUT /api/lead-content/programs/:id`
- `DELETE /api/lead-content/programs/:id`

### 9.7 Events Admin

- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### 9.8 Media Admin

- `GET /api/media`
- `GET /api/media/:id`
- `POST /api/media/upload`
- `DELETE /api/media/:id`

Upload memakai `multipart/form-data`.

Field form yang dipakai:

- `file`
- `alt`
- `title`
- `caption`
- `description`
- `folder`

Catatan storage:

- saat ini backend menyimpan file ke local disk
- Anda berencana migrasi ke Cloudinary
- frontend sebaiknya hanya mengandalkan field `url` yang dikembalikan API
- saat storage diganti ke Cloudinary, frontend tidak perlu berubah besar selama tetap membaca `url` dari response

### 9.9 Site Settings Admin

- `PUT /api/site-settings/:category`

Contoh:

```txt
PUT /api/site-settings/contact
```

Body dikirim sebagai object JSON kategori tersebut.

### 9.10 Users Admin

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### 9.11 Roles Admin

- `GET /api/roles`
- `GET /api/roles/:id`
- `POST /api/roles`
- `PUT /api/roles/:id`

### 9.12 Audit Logs Admin

- `GET /api/audit-logs`

Query filter yang didukung:

- `userId`
- `action`
- `resourceType`
- `page`
- `limit`

### 9.13 Lecturers Admin

- `POST /api/lecturers`
- `PUT /api/lecturers/:id`
- `DELETE /api/lecturers/:id`

### 9.14 Inquiries Admin

- `GET /api/inquiries`
- `PUT /api/inquiries/:id/read`
- `DELETE /api/inquiries/:id`

### 9.15 Pages Admin

- `POST /api/pages`
- `PUT /api/pages/:slug`
- `DELETE /api/pages/:slug`

## 10. Endpoint Access Matrix

### Public

- `GET /api/health`
- `GET /api/categories`
- `GET /api/categories/:id`
- `GET /api/tags`
- `GET /api/tags/:id`
- `GET /api/news`
- `GET /api/news/:slug`
- `GET /api/home-content/:section`
- `GET /api/programs`
- `GET /api/programs/:slug`
- `GET /api/lead-content/:section`
- `GET /api/lead-content/programs`
- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/lecturers`
- `GET /api/lecturers/:id`
- `GET /api/pages`
- `GET /api/pages/:slug`
- `GET /api/site-settings`
- `GET /api/site-settings/:category`
- `POST /api/inquiries`

### Protected Admin / Editor

- write endpoint kategori, tag, news, event
- beberapa content editor endpoint
- media management endpoint

### Protected Admin

- users
- roles
- audit logs
- site settings update
- lecturers write endpoint
- inquiries admin endpoint

## 11. Frontend Data Handling Notes

### 11.1 JSONB fields

Beberapa kolom berasal dari PostgreSQL `JSONB`, jadi frontend harus fleksibel membaca bentuk object/array berikut:

- `home_content.data`
- `lead_content.data`
- `programs.academicInfo`
- `programs.curriculumCategories`
- `programs.courses`
- `programs.graduateProfile`
- `programs.careerOpportunities`
- `programs.concentrations`
- `site_settings.data`
- `roles.permissions`
- `audit_logs.changes`
- `pages.data`

Saran:

- pakai optional chaining
- siapkan fallback value
- jangan hardcode semua field sebagai wajib

### 11.2 Paginated endpoint mapping

Jika frontend memakai list endpoint paginated, baca data dari:

```txt
response.data.items
```

Bukan dari key khusus seperti `articles` atau `users`.

### 11.3 Date fields

Date field dikirim dalam bentuk ISO string. Frontend perlu format sendiri.

Contoh field tanggal:

- `createdAt`
- `updatedAt`
- `publishDate`
- `eventDate`
- `lastLogin`

## 12. Suggested Frontend Integration Order

Urutan paling aman untuk frontend/AI builder:

1. Integrasikan public content dulu
2. Integrasikan login admin
3. Integrasikan content list admin
4. Integrasikan form edit/create
5. Integrasikan media upload
6. Integrasikan users/roles/audit belakangan

Prioritas public:

1. home content
2. programs
3. news
4. events
5. site settings
6. lecturers
7. pages

Prioritas admin:

1. auth
2. home content
3. lead content
4. news
5. programs
6. media
7. categories and tags
8. site settings
9. users, roles, audit

## 13. Example Frontend Fetch Pattern

### Public fetch example

```ts
const response = await fetch('http://localhost:3000/api/news?page=1&limit=10');
const result = await response.json();

const items = result.data.items;
const pagination = result.data.pagination;
```

### Protected fetch example

```ts
const response = await fetch('http://localhost:3000/api/site-settings/contact', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    address: 'Alamat baru',
    phone: '022-123456',
  }),
});
```

### Multipart upload example

```ts
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'Hero Image');
formData.append('folder', 'homepage');

const response = await fetch('http://localhost:3000/api/media/upload', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  body: formData,
});
```

## 14. What To Pass Into Figma AI / React AI

Jika Anda ingin AI di sisi frontend menghubungkan code React hasil Figma, kirim minimal tiga file ini:

1. `FRONTEND_API_INTEGRATION_GUIDE.md`
2. `DEVELOPMENT_CHECKLIST.md`
3. `DB_STATUS_REPORT.md`

Instruksi yang bisa Anda berikan ke AI frontend:

```txt
Gunakan backend STTB ini sebagai source data utama.
Semua endpoint tersedia di base URL http://localhost:3000/api.
Gunakan endpoint public untuk halaman website umum.
Gunakan Bearer token untuk admin CMS.
Untuk list endpoint paginated, baca data dari response.data.items.
Untuk section-based content, baca object utama dari field data.data.
Untuk media, gunakan URL yang dikirim API dan jangan hardcode storage provider.
```

## 15. Kesimpulan

Dokumen ini adalah file handoff yang lebih tepat untuk frontend/Figma AI dibanding file status database saja.

`DB_STATUS_REPORT.md` berguna untuk memahami struktur backend dan database, tetapi untuk integrasi UI, file ini lebih langsung karena menjelaskan:

- endpoint apa yang tersedia
- mana yang public dan protected
- bentuk response
- cara auth
- cara upload file
- bagaimana frontend harus membaca field JSON dan pagination

Jika frontend builder membutuhkan kontrak yang lebih ketat lagi, langkah berikutnya adalah membuat dokumen OpenAPI atau Postman collection. Untuk saat ini, file ini sudah cukup sebagai handoff praktis ke AI frontend.
