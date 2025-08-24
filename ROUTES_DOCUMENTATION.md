# Dokumentasi Route Admin

## Overview
Dokumentasi ini menjelaskan route yang tersedia untuk bagian admin, khususnya untuk Chapter dan Course Material management.

## Route Structure

### Admin Routes (`/admin`)

#### Chapter Management
- `GET /admin/chapters` - Menampilkan daftar semua bab
- `GET /admin/chapters/create` - Form untuk membuat bab baru
- `POST /admin/chapters` - Menyimpan bab baru
- `GET /admin/chapters/{id}/edit` - Form untuk mengedit bab
- `PUT/PATCH /admin/chapters/{id}` - Update bab
- `DELETE /admin/chapters/{id}` - Hapus bab
- `GET /admin/courses/{course}/chapters` - Menampilkan bab berdasarkan kursus tertentu

#### Course Material Management
- `GET /admin/materials` - Menampilkan daftar semua materi
- `GET /admin/materials/create` - Form untuk membuat materi baru
- `POST /admin/materials` - Menyimpan materi baru
- `GET /admin/materials/{id}/edit` - Form untuk mengedit materi
- `PUT/PATCH /admin/materials/{id}` - Update materi
- `DELETE /admin/materials/{id}` - Hapus materi
- `GET /admin/chapters/{chapter}/materials` - Menampilkan materi berdasarkan bab tertentu
- `POST /admin/materials/upload` - Upload file materi

## Controller Methods

### ChapterController
- `index()` - Menampilkan daftar bab dengan paginasi
- `create()` - Form untuk membuat bab baru
- `store()` - Menyimpan bab baru
- `edit()` - Form untuk mengedit bab
- `update()` - Update bab
- `destroy()` - Hapus bab
- `byCourse()` - Menampilkan bab berdasarkan kursus

### CourseMaterialController
- `index()` - Menampilkan daftar materi dengan paginasi
- `create()` - Form untuk membuat materi baru
- `store()` - Menyimpan materi baru
- `edit()` - Form untuk mengedit materi
- `update()` - Update materi
- `destroy()` - Hapus materi
- `byChapter()` - Menampilkan materi berdasarkan bab
- `uploadFile()` - Upload file materi

## Validation Rules

### Chapter
- `course_id` - Required, exists in courses table
- `title` - Required, string, max 255 characters
- `order` - Required, integer, min 1

### Course Material
- `chapter_id` - Required, exists in chapters table
- `title` - Required, string, max 255 characters
- `order` - Required, integer, min 1
- `type` - Required, in: video,document,quiz
- `file_path` - Nullable, string
- `youtube_url` - Nullable, URL
- `is_preview` - Boolean

## File Upload
- Mendukung file types: pdf, doc, docx, ppt, pptx, mp4, mov, avi
- Maximum file size: 10MB
- File disimpan di: `storage/app/public/materials/`

## Middleware
Semua route admin menggunakan middleware:
- `auth` - User harus login
- `verified` - Email harus terverifikasi
- `role:admin` - User harus memiliki role admin