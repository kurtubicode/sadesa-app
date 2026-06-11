# SADESA (Sahabat Digital Desa Cirangkong)

Platform digital terpadu untuk pelayanan warga Desa Cirangkong. Monorepo yang memisahkan **web dashboard** (admin/staff/kepala desa) dan **aplikasi mobile** (warga).

## Project Overview

- **Purpose:** Integrated digital platform for village administration services.
- **Architecture:** Monorepo dual-client (Inertia.js for web dashboard, REST API for mobile app).
- **Backend:** Laravel 12, PHP 8.2+, MySQL 8.
- **Web UI:** Inertia.js v2, React 19, TypeScript, Tailwind CSS v4.
- **Mobile:** Expo SDK 54, React Native 0.81, Expo Router v4.
- **Auth:**
  - Web: Laravel Fortify (Session + Cookie).
  - API: Laravel Sanctum (Bearer Token).
- **Roles:** `admin`, `staff`, `kepala_desa`, `warga`.

## Directory Structure

- `backend/`: Laravel project for web dashboard and API.
- `mobile/`: Expo project for citizen mobile app.
- `docs/`: Technical documentation (API, Architecture, Status).

## Key Tech Stack & Conventions

### Backend (Laravel)
- **Routing:** Web routes in `routes/web.php` (Inertia), API routes in `routes/api.php` (Sanctum).
- **Controllers:**
  - `App\Http\Controllers\Admin\`: Management modules.
  - `App\Http\Controllers\Staff\`: Verification tasks.
  - `App\Http\Controllers\KepalaDesa\`: Approval tasks.
  - `App\Http\Controllers\Api\`: REST endpoints for mobile.
- **Models:** Eloquent ORM with Indonesian naming where appropriate for business logic (e.g., `PengajuanSurat`, `Pengaduan`).
- **Audit Log:** Custom logging via `AuditLog::catat()` model helper.
- **Notifications:** Database-driven notifications for in-app alerts.

### Mobile (Expo)
- **Routing:** File-based routing in `app/`.
- **API Client:** Axios instance in `lib/api.ts` with interceptors for auth tokens.
- **Storage:** `expo-secure-store` for sensitive data like auth tokens.
- **Components:** Functional components with TypeScript.

## Building and Running

### Prerequisites
- PHP >= 8.2
- Composer >= 2.x
- Node.js >= 20 LTS
- MySQL >= 8.0

### Backend Setup
```bash
cd backend
composer install
npm install
cp .env.example .env
php artisan key:generate
# Edit .env for DB connection
php artisan migrate:fresh --seed
php artisan serve --host=0.0.0.0 --port=8000
```
- **Dev Assets:** `npm run dev`
- **Build Assets:** `npm run build`

### Mobile Setup
```bash
cd mobile
npm install
cp .env.example .env
# Edit .env to set EXPO_PUBLIC_API_URL to your local IP
npx expo start
```

## Development Commands

### Backend
- `php artisan migrate`: Run migrations.
- `php artisan migrate:fresh --seed`: Reset DB and seed default data.
- `npm run dev`: Start Vite dev server.
- `npm run lint`: Run ESLint fix.
- `npm run types:check`: Run TypeScript type check.

### Mobile
- `npx expo start`: Start Expo development server.
- `npm run lint`: Run Expo linting.
- `npx expo start --android`: Start on Android.
- `npx expo start --ios`: Start on iOS.

## Default Credentials (Local Dev)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@sadesa.test` | `password` |
| Staff | `staff@sadesa.test` | `password` |
| Kepala Desa | `kepala@sadesa.test` | `password` |
| Warga | `warga@sadesa.test` | `password` |

## Documentation References
- [Architecture Details](docs/architecture.md)
- [API Reference](docs/api.md)
- [Feature Status](docs/FITUR_STATUS.md)
- [Onboarding Guide](docs/onboarding.md)
