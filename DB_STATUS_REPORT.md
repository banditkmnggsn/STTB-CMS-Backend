# STTB Backend - DB & Framework Status Report

Tanggal cek: 2026-03-11

Dokumen ini dibuat dari inspeksi langsung kode backend (`prisma/schema.prisma`, `prisma/migrations`, `package.json`, `src/app.ts`) dan pengecekan `npx prisma migrate status`.

## 1) Executive Summary

- Backend stack utama: Node.js + TypeScript + Express + Prisma ORM + PostgreSQL.
- Status migrasi database: **up to date**.
- Jumlah migrasi saat ini: **2** (`20260311095237_init`, `20260311102845_add_fe_db_compatibility`).
- Total model/tabel domain utama: **16** (termasuk join table `article_tags`).
- Arsitektur konten CMS: gabungan field relasional dan `JSONB` untuk section dinamis.

## 2) Framework & Library yang Dipakai

### Runtime & Language
- Node.js (runtime)
- TypeScript (`typescript` 5.9.3)
- Module output: CommonJS (`tsconfig.json`)

### HTTP/API Layer
- Express (`express` 5.2.1)
- CORS (`cors`)
- Security header (`helmet`)
- Env config (`dotenv`)

### Data Layer
- Prisma ORM (`prisma` 7.4.2)
- Prisma Client (`@prisma/client` 7.4.2)
- Database: PostgreSQL (provider: `postgresql`)

### Auth/Security Utility (dependency tersedia)
- `bcrypt`
- `jsonwebtoken`

## 3) Status Operasional Database

Hasil cek command:

- Command: `npx prisma migrate status`
- Datasource: PostgreSQL database `sttb_db` (schema `public`) di `localhost:5432`
- Migrasi ditemukan: `2 migrations found in prisma/migrations`
- Status: **Database schema is up to date**

## 4) Daftar Tabel Aktif (Berdasarkan Prisma Schema)

1. `users`
2. `roles`
3. `home_content`
4. `programs`
5. `pages`
6. `lead_content`
7. `news_articles`
8. `article_tags` (join M:N)
9. `events`
10. `lecturers`
11. `inquiries`
12. `categories`
13. `tags`
14. `media_files`
15. `site_settings`
16. `audit_logs`

## 5) Relasi Inti Antar Data

- `users.role_id -> roles.id` (many users to one role)
- `news_articles.author_id -> users.id` (many articles to one author)
- `news_articles.category_id -> categories.id` (many articles to one category, nullable)
- `article_tags.article_id -> news_articles.id`
- `article_tags.tag_id -> tags.id`
- `categories.parent_id -> categories.id` (hierarchical category)
- `media_files.uploaded_by -> users.id`
- `pages.updated_by -> users.id`
- `site_settings.updated_by -> users.id`
- `home_content.updated_by -> users.id`
- `lead_content.updated_by -> users.id`
- `programs.updated_by -> users.id`
- `audit_logs.user_id -> users.id`

## 6) Pola Data Penting untuk Frontend

- Banyak modul CMS pakai `is_active` untuk kontrol publish/visibility.
- Konten dinamis section-based disimpan dalam `JSONB`:
  - `home_content.data`
  - `lead_content.data`
  - `site_settings.data`
  - beberapa field di `programs` (`academic_info`, `courses`, dst)
- SEO field tersedia di `programs` (`seo_title`, `seo_description`).
- Artikel mendukung state `draft/published` via `news_articles.status` + `publish_date`.
- Artikel/media mendukung tipe konten via enum `news_articles.type`: `article`, `video`, `podcast`, `bulletin`.
- Konten video/podcast mendukung `news_articles.media_url` + `news_articles.duration`.
- Event mendukung kapasitas dan counter pendaftar (`capacity`, `registered_count`).
- Event mendukung segmentasi LEAD via `events.is_lead_event` dan label tipe via `events.event_type`.
- Halaman dinamis universal didukung oleh tabel `pages` (slug + JSON data).
- Direktori dosen/staf didukung tabel `lecturers`.
- Contact form frontend didukung tabel `inquiries`.

## 7) Update Kompatibilitas FE (Laporan Terbaru)

Poin tambahan dari FE sudah diakomodasi sebagai berikut:

- Universal page builder: **ditambahkan** tabel `pages`.
- Media content (video/podcast): **ditambahkan** `news_articles.type`, `media_url`, `duration`.
- Direktori dosen/staf: **ditambahkan** tabel `lecturers`.
- Segmentasi event LEAD vs umum: **ditambahkan** `events.is_lead_event` dan `events.event_type`.
- Penampungan contact form: **ditambahkan** tabel `inquiries`.

Catatan: field `events.category` yang sudah ada tetap dipertahankan untuk kompatibilitas data existing.

## 8) API/Service Readiness (Current Code Snapshot)

- Server Express sudah berjalan dengan middleware dasar dan endpoint health:
  - `GET /api/health`
- Folder `controllers`, `routes`, `services`, `middleware` sudah ada, namun implementasi endpoint domain belum terlihat pada snapshot saat ini.

## 9) Kesimpulan untuk Tim Frontend

- Struktur database CMS sudah lengkap untuk modul: Users/Roles, Home, Programs, News, Categories/Tags, Events, Media, Settings, Audit.
- Skema database berada pada kondisi sinkron dengan migrasi awal.
- Frontend bisa mulai integrasi berbasis kontrak data tabel yang sudah stabil, dengan perhatian khusus pada field `JSONB` agar parser/typing dibuat fleksibel.
