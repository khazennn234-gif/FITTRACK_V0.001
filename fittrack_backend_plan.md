# 🚀 FitTrack — Backend & API Endpoints Plan

> **Context:** Frontend sudah ~80% selesai menggunakan Vite + TypeScript + MediaPipe + Chart.js.
> Data saat ini disimpan di `localStorage`. Backend ini akan menggantikan localStorage dengan
> persistent cloud storage, multi-device sync, dan kemampuan analitik lanjutan.

---

## 📋 Daftar Isi
1. [Tech Stack Backend](#tech-stack)
2. [Arsitektur Sistem](#arsitektur)
3. [Database Schema](#database)
4. [API Endpoints (REST)](#api-endpoints)
5. [Authentication & Authorization](#auth)
6. [Migrasi dari localStorage](#migrasi)
7. [Deployment Strategy](#deployment)
8. [Urutan Implementasi](#implementasi)

---

## 1. Tech Stack Backend {#tech-stack}

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Runtime** | **Node.js + Express.js** | Familiar, ekosistem besar, cocok untuk REST API |
| **Language** | **TypeScript** | Konsisten dengan frontend, type-safe |
| **Database** | **PostgreSQL** | Relational, cocok untuk data workout yang terstruktur |
| **ORM** | **Prisma** | Type-safe, auto-migration, developer friendly |
| **Auth** | **JWT + bcrypt** | Stateless auth, aman, mudah diimplementasi |
| **File Storage** | **Cloudinary / Supabase Storage** | Avatar upload untuk profil user |
| **Validation** | **Zod** | Konsisten dengan frontend type system |
| **API Docs** | **Swagger (OpenAPI 3.0)** | Auto-generated dari kode |
| **Testing** | **Jest + Supertest** | Unit + integration test |
| **Cache** | **Redis** (optional, fase 2) | Cache leaderboard & agregasi statistik |

> [!TIP]
> **Alternatif lebih simpel:** Gunakan **Supabase** (PostgreSQL as a Service + Auth bawaan + Realtime).
> Ini akan menghemat waktu setup signifikan jika ingin cepat production-ready.
> Pilihan ini sangat direkomendasikan untuk MVP.

---

## 2. Arsitektur Sistem {#arsitektur}

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  Vite + TypeScript + MediaPipe + Chart.js                       │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │
│  │  storage.ts │──▶│  api.ts     │──▶│  HTTP REST Requests │   │
│  │(localStorage│   │ (new layer) │   │  (fetch/axios)      │   │
│  │  fallback)  │   └─────────────┘   └──────────┬──────────┘   │
│  └─────────────┘                                │              │
└─────────────────────────────────────────────────│──────────────┘
                                                  │
                              ┌───────────────────▼──────────────┐
                              │         API GATEWAY               │
                              │   (CORS, Rate Limit, Auth Guard)  │
                              └───────────────────┬──────────────┘
                                                  │
              ┌───────────────┬───────────────────┼──────────────────┐
              │               │                   │                  │
    ┌─────────▼──────┐ ┌──────▼──────┐ ┌─────────▼──────┐ ┌────────▼──────┐
    │   Auth Router  │ │User Router  │ │Workout Router  │ │Progress Router│
    │  /api/auth     │ │ /api/users  │ │ /api/workouts  │ │/api/progress  │
    └─────────┬──────┘ └──────┬──────┘ └─────────┬──────┘ └────────┬──────┘
              │               │                   │                  │
              └───────────────┴───────────────────┴──────────────────┘
                                          │
                              ┌───────────▼──────────────┐
                              │      Prisma ORM           │
                              └───────────┬──────────────┘
                                          │
                              ┌───────────▼──────────────┐
                              │      PostgreSQL           │
                              │   (users, sessions,      │
                              │    profiles, settings)   │
                              └──────────────────────────┘
```

### 📁 Struktur Folder Backend

```
fittrack-backend/
├── src/
│   ├── app.ts                # Express app setup
│   ├── server.ts             # Entry point
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── workouts.routes.ts
│   │   ├── sessions.routes.ts
│   │   └── progress.routes.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── workouts.controller.ts
│   │   ├── sessions.controller.ts
│   │   └── progress.controller.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # JWT guard
│   │   ├── validate.middleware.ts # Zod validation
│   │   └── rateLimit.middleware.ts
│   │
│   ├── schemas/              # Zod schemas (shared types)
│   │   ├── auth.schema.ts
│   │   ├── session.schema.ts
│   │   └── user.schema.ts
│   │
│   ├── services/             # Business logic
│   │   ├── auth.service.ts
│   │   ├── session.service.ts
│   │   └── stats.service.ts
│   │
│   └── utils/
│       ├── jwt.utils.ts
│       ├── hash.utils.ts
│       └── calories.utils.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│   ├── auth.test.ts
│   ├── sessions.test.ts
│   └── progress.test.ts
│
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 3. Database Schema {#database}

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String    @id @default(cuid())
  email       String    @unique
  password    String    // bcrypt hashed
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  profile     Profile?
  settings    Settings?
  sessions    WorkoutSession[]

  @@map("users")
}

model Profile {
  id           String    @id @default(cuid())
  userId       String    @unique
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  name         String
  avatarUrl    String?
  role         String    @default("ATHLETE")      // ATHLETE, PRO TRAINER
  tier         String    @default("Tier I Athlete")
  height       Float?    // cm
  weight       Float?    // kg
  age          Int?
  fitnessGoal  String    @default("strength")     // strength | cardio | mobility
  fitnessLevel String    @default("beginner")     // beginner | intermediate | advanced
  dailyRepTarget Int     @default(30)
  joinedDate   DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@map("profiles")
}

model Settings {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  soundVolume     Int       @default(80)          // 0-100
  soundFeedback   Boolean   @default(true)
  gpuAcceleration Boolean   @default(true)
  cameraMirror    Boolean   @default(true)
  poseStrictness  String    @default("normal")    // loose | normal | strict
  difficulty      String    @default("normal")    // easy | normal | strict
  darkMode        Boolean   @default(true)
  updatedAt       DateTime  @updatedAt

  @@map("settings")
}

model WorkoutSession {
  id           String    @id @default(cuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  date         DateTime  @default(now())
  exercise     String                             // squat | pushup | jumping-jack | ...
  exerciseIcon String
  reps         Int
  targetReps   Int
  duration     Int                                // seconds
  formScore    Float                              // 0-100
  goodReps     Int
  badReps      Int
  calories     Float
  statusBadge  String?                            // SEMPURNA | PERLU PERBAIKAN | ...

  feedback     RepFeedback[]

  @@index([userId, date])
  @@index([userId, exercise])
  @@map("workout_sessions")
}

model RepFeedback {
  id        String         @id @default(cuid())
  sessionId String
  session   WorkoutSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  rep       Int
  message   String
  type      String         // good | bad

  @@map("rep_feedback")
}
```

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Profile : "has one"
    User ||--o| Settings : "has one"
    User ||--o{ WorkoutSession : "has many"
    WorkoutSession ||--o{ RepFeedback : "has many"

    User {
        string id PK
        string email UK
        string password
        datetime createdAt
        datetime updatedAt
    }

    Profile {
        string id PK
        string userId FK
        string name
        string avatarUrl
        string role
        string tier
        float height
        float weight
        int age
        string fitnessGoal
        string fitnessLevel
        int dailyRepTarget
    }

    WorkoutSession {
        string id PK
        string userId FK
        datetime date
        string exercise
        int reps
        int targetReps
        int duration
        float formScore
        int goodReps
        int badReps
        float calories
        string statusBadge
    }

    RepFeedback {
        string id PK
        string sessionId FK
        int rep
        string message
        string type
    }
```

---

## 4. API Endpoints (REST) {#api-endpoints}

**Base URL:** `https://api.fittrack.app/api/v1`

**Response Format (standar semua endpoint):**
```json
{
  "success": true,
  "data": { ... },
  "message": "OK",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token expired or invalid"
  }
}
```

---

### 🔐 Auth Endpoints

| Method | Endpoint | Deskripsi | Auth? |
|--------|----------|-----------|-------|
| `POST` | `/auth/register` | Daftar akun baru | ❌ |
| `POST` | `/auth/login` | Login, return JWT | ❌ |
| `POST` | `/auth/logout` | Invalidate token | ✅ |
| `POST` | `/auth/refresh` | Refresh access token | ✅ |
| `POST` | `/auth/forgot-password` | Kirim reset email | ❌ |
| `POST` | `/auth/reset-password` | Reset password via token | ❌ |

#### `POST /auth/register`
```json
// Request Body
{
  "name": "Alex Pratama",
  "email": "alex@example.com",
  "password": "SecurePass123!"
}

// Response 201
{
  "success": true,
  "data": {
    "user": { "id": "cuid...", "email": "alex@example.com" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### `POST /auth/login`
```json
// Request Body
{
  "email": "alex@example.com",
  "password": "SecurePass123!"
}

// Response 200
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "..." },
    "accessToken": "eyJ...",   // expires: 15 min
    "refreshToken": "eyJ..."   // expires: 7 days
  }
}
```

---

### 👤 User / Profile Endpoints

| Method | Endpoint | Deskripsi | Auth? |
|--------|----------|-----------|-------|
| `GET` | `/users/me` | Get current user + profile | ✅ |
| `PUT` | `/users/me/profile` | Update profil (nama, tinggi, berat, dll) | ✅ |
| `POST` | `/users/me/avatar` | Upload foto avatar | ✅ |
| `DELETE` | `/users/me` | Hapus akun permanen | ✅ |

#### `GET /users/me`
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "cuid...",
    "email": "alex@example.com",
    "profile": {
      "name": "Alex Pratama",
      "avatarUrl": "https://cdn.fittrack.app/avatars/alex.jpg",
      "role": "ATHLETE",
      "tier": "Tier II Athlete",
      "height": 170,
      "weight": 65,
      "age": 25,
      "fitnessGoal": "strength",
      "fitnessLevel": "intermediate",
      "dailyRepTarget": 50,
      "joinedDate": "2026-10-01T00:00:00.000Z"
    }
  }
}
```

#### `PUT /users/me/profile`
```json
// Request Body (semua field optional — partial update)
{
  "name": "Alex Pratama Updated",
  "height": 172,
  "weight": 64,
  "fitnessGoal": "cardio",
  "dailyRepTarget": 60
}

// Response 200
{
  "success": true,
  "data": { ...updatedProfile }
}
```

#### `POST /users/me/avatar`
```
// Content-Type: multipart/form-data
// Body: file (image/jpeg, image/png, max 5MB)

// Response 200
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.fittrack.app/avatars/alex_new.jpg"
  }
}
```

---

### ⚙️ Settings Endpoints

| Method | Endpoint | Deskripsi | Auth? |
|--------|----------|-----------|-------|
| `GET` | `/users/me/settings` | Get semua pengaturan | ✅ |
| `PUT` | `/users/me/settings` | Update pengaturan (partial OK) | ✅ |

#### `PUT /users/me/settings`
```json
// Request Body (partial update)
{
  "soundVolume": 70,
  "poseStrictness": "strict",
  "darkMode": true
}

// Response 200
{
  "success": true,
  "data": {
    "soundVolume": 70,
    "soundFeedback": true,
    "gpuAcceleration": true,
    "cameraMirror": true,
    "poseStrictness": "strict",
    "difficulty": "normal",
    "darkMode": true
  }
}
```

---

### 🏋️ Workout Session Endpoints

| Method | Endpoint | Deskripsi | Auth? |
|--------|----------|-----------|-------|
| `POST` | `/sessions` | Simpan sesi workout baru | ✅ |
| `GET` | `/sessions` | List semua sesi (pagination, filter) | ✅ |
| `GET` | `/sessions/:id` | Detail satu sesi | ✅ |
| `DELETE` | `/sessions/:id` | Hapus satu sesi | ✅ |
| `DELETE` | `/sessions` | Hapus semua sesi user | ✅ |

#### `POST /sessions`
```json
// Request Body
{
  "exercise": "squat",
  "exerciseIcon": "🦵",
  "reps": 15,
  "targetReps": 15,
  "duration": 134,
  "formScore": 92,
  "goodReps": 14,
  "badReps": 1,
  "calories": 42,
  "statusBadge": "SEMPURNA",
  "feedback": [
    {
      "rep": 7,
      "message": "Turun 5° lebih dalam untuk aktivasi gluteus",
      "type": "bad"
    }
  ]
}

// Response 201
{
  "success": true,
  "data": {
    "id": "cuid_new_session",
    "userId": "cuid_user",
    "date": "2026-10-10T05:30:00.000Z",
    "exercise": "squat",
    ...
  }
}
```

#### `GET /sessions`
```
// Query Parameters:
// ?page=1&limit=20         → Pagination
// ?exercise=squat          → Filter by exercise
// ?from=2026-10-01         → Date range start
// ?to=2026-10-10           → Date range end
// ?sort=date_desc          → Sorting

// Response 200
{
  "success": true,
  "data": [ ...sessions ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "totalPages": 3
  }
}
```

#### `GET /sessions/:id`
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "cuid...",
    "date": "2026-10-10T05:30:00.000Z",
    "exercise": "squat",
    "exerciseIcon": "🦵",
    "reps": 15,
    "targetReps": 15,
    "duration": 134,
    "formScore": 92,
    "goodReps": 14,
    "badReps": 1,
    "calories": 42,
    "statusBadge": "SEMPURNA",
    "feedback": [
      { "rep": 7, "message": "Turun 5° lebih dalam...", "type": "bad" }
    ]
  }
}
```

---

### 📈 Progress & Analytics Endpoints

| Method | Endpoint | Deskripsi | Auth? |
|--------|----------|-----------|-------|
| `GET` | `/progress/summary` | Ringkasan keseluruhan stats user | ✅ |
| `GET` | `/progress/weekly` | Data chart 7 hari terakhir | ✅ |
| `GET` | `/progress/monthly` | Data chart 30 hari terakhir | ✅ |
| `GET` | `/progress/streak` | Hitung streak hari aktif | ✅ |
| `GET` | `/progress/best/:exercise` | Personal best per latihan | ✅ |
| `GET` | `/progress/by-exercise` | Agregasi per jenis latihan | ✅ |

#### `GET /progress/summary`
```json
// Response 200
{
  "success": true,
  "data": {
    "totalSessions": 47,
    "totalReps": 847,
    "totalCalories": 3420,
    "totalDurationSeconds": 15300,  // 4h 15m
    "averageFormScore": 87,
    "currentStreak": 5,
    "longestStreak": 12,
    "mostFrequentExercise": "squat"
  }
}
```

#### `GET /progress/weekly`
```json
// Response 200 (data untuk chart 7 hari)
{
  "success": true,
  "data": {
    "labels": ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    "datasets": {
      "reps":      [15, 0, 30, 10, 25, 0, 15],
      "formScore": [92, 0, 95, 78, 85, 0, 88],
      "calories":  [42, 0, 55, 31, 48, 0, 38]
    }
  }
}
```

#### `GET /progress/streak`
```json
// Response 200
{
  "success": true,
  "data": {
    "currentStreak": 5,
    "longestStreak": 12,
    "lastActiveDate": "2026-10-10",
    "activeDates": ["2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10"]
  }
}
```

#### `GET /progress/best/:exercise`
```
// :exercise = squat | pushup | jumping-jack | lateral-raise | shoulder-press | bicep-curl | lunge

// Response 200
{
  "success": true,
  "data": {
    "exercise": "squat",
    "bestReps": 25,
    "bestFormScore": 95,
    "totalSessions": 18,
    "averageFormScore": 88,
    "lastSession": "2026-10-08T05:30:00.000Z"
  }
}
```

#### `GET /progress/by-exercise`
```json
// Response 200
{
  "success": true,
  "data": [
    {
      "exercise": "squat",
      "exerciseIcon": "🦵",
      "totalSessions": 18,
      "totalReps": 320,
      "bestReps": 25,
      "averageFormScore": 88
    },
    {
      "exercise": "pushup",
      "exerciseIcon": "💪",
      "totalSessions": 12,
      "totalReps": 180,
      "bestReps": 18,
      "averageFormScore": 82
    }
  ]
}
```

---

## 5. Authentication & Authorization {#auth}

### JWT Strategy

```
Token Flow:
┌──────────┐         ┌──────────────────┐        ┌──────────────┐
│  Client  │         │  Auth Service    │        │  Protected   │
│          │         │                  │        │  Endpoints   │
│  login() │────────▶│  verify creds   │        │              │
│          │◀────────│  return tokens   │        │              │
│          │         │                  │        │              │
│  request │──────────────────────────────────────▶ verify JWT  │
│ + Bearer │         │                  │        │  allow/deny  │
│  token   │         │                  │        │              │
│          │         │                  │        │              │
│ (expired)│──────────────────────────────────────▶ 401 Expired │
│          │         │                  │        │              │
│  refresh │────────▶│  verify refresh  │        │              │
│          │◀────────│  new accessToken │        │              │
└──────────┘         └──────────────────┘        └──────────────┘
```

### Token Spec
| Token | Expiry | Storage (Frontend) |
|-------|--------|-------------------|
| Access Token | 15 menit | `memory` (variable) |
| Refresh Token | 7 hari | `httpOnly cookie` (lebih aman) |

### Middleware Auth Guard
```typescript
// middlewares/auth.middleware.ts
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};
```

---

## 6. Migrasi dari localStorage {#migrasi}

Ini adalah langkah paling kritis — bagaimana frontend beralih dari localStorage ke API tanpa breaking changes.

### Strategy: API Layer Abstraction

Buat file `src/api.ts` baru di frontend sebagai **wrapper** yang menggantikan fungsi-fungsi di `storage.ts`:

```typescript
// src/api.ts — NEW FILE
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

let accessToken: string | null = null;

// Token management
export function setAccessToken(token: string) { accessToken = token; }
export function clearAccessToken() { accessToken = null; }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // for httpOnly cookie (refresh token)
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    // Auto-refresh on 401
    if (res.status === 401 && path !== '/auth/refresh') {
      await refreshToken();
      return request(path, options); // retry
    }
    throw await res.json();
  }
  
  return res.json().then(r => r.data);
}

// --- Auth ---
export const api = {
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  profile: {
    get: () => request('/users/me'),
    update: (body) => request('/users/me/profile', { method: 'PUT', body: JSON.stringify(body) }),
  },
  settings: {
    get: () => request('/users/me/settings'),
    update: (body) => request('/users/me/settings', { method: 'PUT', body: JSON.stringify(body) }),
  },
  sessions: {
    create: (body) => request('/sessions', { method: 'POST', body: JSON.stringify(body) }),
    list: (params?) => request(`/sessions?${new URLSearchParams(params)}`),
    get: (id) => request(`/sessions/${id}`),
    delete: (id) => request(`/sessions/${id}`, { method: 'DELETE' }),
  },
  progress: {
    summary: () => request('/progress/summary'),
    weekly: () => request('/progress/weekly'),
    streak: () => request('/progress/streak'),
    bestForExercise: (ex) => request(`/progress/best/${ex}`),
    byExercise: () => request('/progress/by-exercise'),
  },
};
```

### Migrasi Bertahap (Phased)

```
Phase 1 (Sekarang): 
  localStorage ──▶ Semua data di browser (DONE)

Phase 2 (Backend MVP):
  localStorage ──▶ API calls (ganti fungsi di storage.ts)
  Tetap ada localStorage sebagai OFFLINE FALLBACK

Phase 3 (Full Cloud):
  API ──▶ Primary source of truth
  localStorage hanya untuk caching offline
  Sync otomatis saat online kembali
```

---

## 7. Deployment Strategy {#deployment}

### Option A: Self-hosted (VPS)

```
┌─────────────────────────────────────────────┐
│              VPS (Ubuntu 22.04)             │
│                                             │
│  ┌─────────────┐     ┌──────────────────┐   │
│  │   Nginx     │────▶│  Node.js App     │   │
│  │  (reverse   │     │  (PM2 cluster)   │   │
│  │   proxy)    │     │  :3000           │   │
│  └─────────────┘     └────────┬─────────┘   │
│                               │             │
│                     ┌─────────▼─────────┐   │
│                     │   PostgreSQL 16   │   │
│                     │   :5432           │   │
│                     └───────────────────┘   │
└─────────────────────────────────────────────┘

Domain: api.fittrack.app  (via Cloudflare)
SSL:    Let's Encrypt (Certbot)
```

### Option B: PaaS (Lebih Mudah — Direkomendasikan untuk MVP)

| Service | Platform | Biaya |
|---------|----------|-------|
| **API (Node.js)** | Railway / Render | Free tier ada |
| **Database** | Supabase / Railway PostgreSQL | Free tier ada |
| **Frontend** | Vercel / Netlify | Free |
| **File Storage** | Cloudinary | Free tier 25GB |

### Environment Variables

```env
# .env (backend)
DATABASE_URL="postgresql://user:pass@host:5432/fittrack"
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_REFRESH_SECRET="another-super-secret-key"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
CORS_ORIGINS="http://localhost:5173,https://fittrack.app"
PORT=3000
NODE_ENV="development"
```

---

## 8. Urutan Implementasi {#implementasi}

> [!IMPORTANT]
> Ikuti urutan ini agar setiap fase langsung bisa ditest dan diintegrasikan dengan frontend.

### Phase 1 — Foundation (Estimasi: 2-3 hari)
- [ ] Setup project Node.js + TypeScript + Express
- [ ] Konfigurasi Prisma + PostgreSQL (local dengan Docker)
- [ ] Buat model database (migrate)
- [ ] Setup `app.ts` dengan CORS, helmet, rate-limiter

### Phase 2 — Auth (Estimasi: 1-2 hari)
- [ ] `POST /auth/register` — hash password, create user+profile+settings
- [ ] `POST /auth/login` — verify, return JWT pair
- [ ] `POST /auth/refresh` — validate refresh token, return new access token
- [ ] `POST /auth/logout` — clear cookie
- [ ] Auth middleware (`requireAuth`)
- [ ] Update frontend: `src/pages/login.ts` & `register.ts` → pakai `api.auth`

### Phase 3 — User & Profile (Estimasi: 1 hari)
- [ ] `GET /users/me` — return user + profile + settings
- [ ] `PUT /users/me/profile` — partial update
- [ ] `PUT /users/me/settings` — partial update
- [ ] Update frontend: `src/pages/profile.ts` → pakai `api.profile` & `api.settings`
- [ ] Update frontend: `src/pages/onboarding.ts` → simpan ke API

### Phase 4 — Workout Sessions (Estimasi: 1-2 hari)
- [ ] `POST /sessions` — simpan sesi baru setelah workout
- [ ] `GET /sessions` — list dengan pagination & filter
- [ ] `GET /sessions/:id` — detail sesi
- [ ] `DELETE /sessions/:id` — hapus sesi
- [ ] Update frontend: `src/pages/summary.ts` → `api.sessions.create()` setelah workout
- [ ] Update frontend: `src/pages/home.ts` → `api.sessions.list({ limit: 3 })`
- [ ] Update frontend: `src/storage.ts` → `saveSession()` call API, fallback localStorage

### Phase 5 — Progress & Analytics (Estimasi: 1-2 hari)
- [ ] `GET /progress/summary` — aggregasi semua stats
- [ ] `GET /progress/weekly` — data chart 7 hari
- [ ] `GET /progress/streak` — hitung streak
- [ ] `GET /progress/by-exercise` — breakdown per exercise
- [ ] Update frontend: `src/pages/progress.ts` → pakai `api.progress`
- [ ] Update frontend: `src/pages/home.ts` (stats dashboard) → pakai `api.progress.summary`

### Phase 6 — Polish & Production (Estimasi: 2-3 hari)
- [ ] Avatar upload (`POST /users/me/avatar`) + Cloudinary integration
- [ ] Request validation dengan Zod di semua endpoint
- [ ] Error handling global middleware
- [ ] Unit tests (Jest + Supertest) untuk semua routes
- [ ] API documentation (Swagger UI)
- [ ] Deploy ke Railway/Render
- [ ] Setup Cloudflare untuk frontend + API domain
- [ ] Environment variables di production
- [ ] Health check endpoint (`GET /health`)

---

## 📊 Summary Tabel Endpoints

| # | Method | Endpoint | Auth | Deskripsi |
|---|--------|----------|------|-----------|
| 1 | POST | `/auth/register` | ❌ | Registrasi user baru |
| 2 | POST | `/auth/login` | ❌ | Login, return JWT |
| 3 | POST | `/auth/logout` | ✅ | Logout, clear cookie |
| 4 | POST | `/auth/refresh` | ✅ | Refresh access token |
| 5 | POST | `/auth/forgot-password` | ❌ | Kirim reset email |
| 6 | POST | `/auth/reset-password` | ❌ | Reset password |
| 7 | GET | `/users/me` | ✅ | Get current user + profile |
| 8 | PUT | `/users/me/profile` | ✅ | Update profil |
| 9 | POST | `/users/me/avatar` | ✅ | Upload avatar |
| 10 | DELETE | `/users/me` | ✅ | Hapus akun |
| 11 | GET | `/users/me/settings` | ✅ | Get pengaturan |
| 12 | PUT | `/users/me/settings` | ✅ | Update pengaturan |
| 13 | POST | `/sessions` | ✅ | Simpan sesi workout |
| 14 | GET | `/sessions` | ✅ | List sesi (paginated) |
| 15 | GET | `/sessions/:id` | ✅ | Detail sesi |
| 16 | DELETE | `/sessions/:id` | ✅ | Hapus satu sesi |
| 17 | DELETE | `/sessions` | ✅ | Hapus semua sesi |
| 18 | GET | `/progress/summary` | ✅ | Overall stats |
| 19 | GET | `/progress/weekly` | ✅ | Chart data 7 hari |
| 20 | GET | `/progress/monthly` | ✅ | Chart data 30 hari |
| 21 | GET | `/progress/streak` | ✅ | Streak harian |
| 22 | GET | `/progress/best/:exercise` | ✅ | Personal best per exercise |
| 23 | GET | `/progress/by-exercise` | ✅ | Breakdown per jenis latihan |

**Total: 23 endpoints** — 4 publik, 19 protected

---

> [!NOTE]
> **Untuk Supabase Route (Alternatif Lebih Cepat):** Jika ingin skip setup backend dari scratch,
> Supabase menyediakan PostgreSQL + Auth + Storage + REST API otomatis hanya dengan definisi tabel.
> Dengan Supabase, Phase 1-3 bisa selesai dalam 1 hari. Rekomendasikan ini untuk MVP.
