# ⚡ FitTrack AI — Real-Time Athletic Pose Coach & Workout Assistant

FitTrack AI adalah aplikasi pelatih kebugaran cerdas berbasis web (*browser-native*) yang menggabungkan deteksi postur **Google MediaPipe (60 FPS)** dengan backend REST API tangguh dan arsitektur keamanan berlapis (*OWASP Top 10 Hardened*).

---

## ✨ Fitur Utama

- **🎥 60 FPS Real-Time Pose Detection**: Pelacakan sudut sendi dan biomekanika tubuh langsung melalui webcam tanpa mengirim frame video ke server (Privasi 100% terjaga).
- **🏋️ 7 Jenis Latihan Didukung**:
  - *Squat* (Sudut lutut & paha depan)
  - *Push-Up* (Keseimbangan torso & siku 90°)
  - *Jumping Jack* (Abduksi lengan & kaki)
  - *Lateral Raise* (Elevasi bahu)
  - *Shoulder Press* (Ekstensi overhead)
  - *Bicep Curl* (Fleksi sendi siku)
  - *Lunges* (Sudut lutut & torso tegak)
- **🔊 Live Workout HUD & Audio Coach**: Umpan balik kinetik real-time, skor akurasi bentuk (*form score*), dan panduan audio/suara.
- **📊 Analisis & Riwayat Progres**: Visualisasi tren konsistensi 7 hari & 30 hari, pelacakan *streak* harian, dan personal best per latihan via Chart.js.
- **☁️ Cloud Sync & Offline Fallback**: Sinkronisasi dua arah otomatis antara `localStorage` dan REST API backend saat online.
- **🛡️ Keamanan Berlapis (Security Hardened)**:
  - Perlindungan Brute-Force & DoS via `express-rate-limit`.
  - Pertahanan Anti-XSS (*Content-Security-Policy* & sanitasi input).
  - Pertahanan Mass Assignment / Privilege Escalation.
  - JWT Dual-Token (Access + Refresh) dengan algoritma terkunci `HS256`.
  - HTTP Security Headers lengkap dengan `Helmet`.

---

## 🏗️ Tech Stack

### Frontend
- **Framework / Bundler**: [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Vision Engine**: [@mediapipe/tasks-vision](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker)
- **Visualisasi Data**: [Chart.js](https://www.chartjs.org/)
- **Styling**: Vanilla CSS (High-Tech Minimalist Athletic Dark Aesthetic)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **ORM & Database**: [Prisma](https://www.prisma.io/) + SQLite (Zero-config local) / PostgreSQL (Supabase / Neon ready)
- **Keamanan**: `helmet`, `express-rate-limit`, `bcryptjs`, `jsonwebtoken`, `zod`

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Clone Repository & Install Dependensi

```bash
git clone https://github.com/khazennn234-gif/FITTRACK_V0.001.git
cd FITTRACK_V0.001

# Install dependensi frontend & root
npm install

# Install dependensi backend
cd backend
npm install
cd ..
```

### 2. Setup Environment Variables & Database

Salin konfigurasi default:
```bash
cp backend/.env.example backend/.env
```

Generate Prisma client & buat database lokal (SQLite):
```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
cd ..
```

### 3. Menjalankan Aplikasi

Jalankan server backend (Port 3000):
```bash
npm run backend:dev
```

Di terminal terpisah, jalankan server frontend Vite (Port 5173):
```bash
npm run dev
```

Buka browser Anda di `http://localhost:5173`.

---

## 🧪 Pengujian & Audit Keamanan

Project ini dilengkapi dengan test runner otomatis:

```bash
# 1. Jalankan pengujian fungsional seluruh API endpoint (19 tests)
npm run backend:test

# 2. Jalankan audit penetrasi keamanan (CORS, ReDoS, IDOR, Mass Assignment, XSS)
npm run security:test
```

---

## 🔑 Akun Demo Bawaan
- **Email**: `alex@example.com`
- **Password**: `Password123!`

---

## 📄 Lisensi
Distributed under the ISC License.
