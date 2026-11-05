// FitTrack — Dashboard Utama
// Redesigned to Minimalist Luxury Athletic Aesthetic (Matte Charcoal & Electric Lime #9EF01A)
// Clean Vector SVGs (zero casual emojis)

import { router } from '../router';
import { escapeHtml } from '../security';
import {
  IconBolt,
  IconCamera,
  IconFlame,
  IconUser,
  IconChart,
  IconShield,
  IconClock,
  IconTarget,
  IconInfo,
  IconArrowRight,
  getExerciseIconSvg,
} from '../icons';
import {
  getProfile,
  getStreak,
  getTotalReps,
  getAverageScore,
  getTotalCalories,
  getTotalHoursFormatted,
  getRecentSessions,
} from '../storage';

export function renderHomePage(): string {
  const profile = getProfile();
  const streak = getStreak();
  const totalReps = getTotalReps();
  const avgScore = getAverageScore();
  const totalCalories = getTotalCalories();
  const totalHours = getTotalHoursFormatted();
  const recentSessions = getRecentSessions(4);

  // Time-aware greeting
  const hour = new Date().getHours();
  let timeGreeting = 'Selamat Datang Kembali';
  if (hour < 11) timeGreeting = 'Selamat Pagi';
  else if (hour < 15) timeGreeting = 'Selamat Siang';
  else if (hour < 18) timeGreeting = 'Selamat Sore';
  else timeGreeting = 'Selamat Malam';

  const recentListHTML = recentSessions.length > 0 ? recentSessions.map(session => {
    const isSquat = session.exercise === 'squat';
    const isPushup = session.exercise === 'pushup';
    const isLunge = session.exercise === 'lunge';
    const isLat = session.exercise === 'lateral-raise';
    const isShoulder = session.exercise === 'shoulder-press';
    const isCurl = session.exercise === 'bicep-curl';
    
    let exerciseName = 'Jumping Jack';
    if (isSquat) exerciseName = 'Squat';
    else if (isPushup) exerciseName = 'Push-Up';
    else if (isLunge) exerciseName = 'Lunges';
    else if (isLat) exerciseName = 'Lateral Raise';
    else if (isShoulder) exerciseName = 'Shoulder Press';
    else if (isCurl) exerciseName = 'Bicep Curl';

    const scoreClass = session.formScore >= 90 ? 'text-lime font-bold' : session.formScore >= 75 ? 'text-cyan font-bold' : 'text-warning font-bold';

    return `
      <div class="activity-item dash-recent-item" data-ex="${session.exercise}" style="cursor: pointer;" title="Klik untuk membuka riwayat latihan">
        <div class="activity-left">
          <div class="ex-icon-square" style="width: 38px; height: 38px;">
            ${getExerciseIconSvg(session.exercise, 18)}
          </div>
          <div>
            <div class="act-title">${exerciseName}</div>
            <div class="act-sub">${session.reps} reps • ${Math.floor(session.duration / 60)}m ${session.duration % 60}s • ${session.calories} kkal</div>
          </div>
        </div>
        <div class="act-score ${scoreClass}">
          ${session.formScore}% FORM
        </div>
      </div>
    `;
  }).join('') : `
    <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
      Belum ada sesi latihan. Klik tombol <strong>Mulai Latihan</strong> di atas untuk merekam sesi pertamamu.
    </div>
  `;

  return `
    <div class="dashboard-page">
      <!-- Top Telemetry Header Bar -->
      <header class="dash-top-bar">
        <div class="dash-top-badges">
          <div class="top-pill top-pill--engine">
            ${IconBolt(12, '#9EF01A')}
            <span>AI VISION ENGINE: 60 FPS READY</span>
          </div>
          <div class="top-pill">
            ${IconCamera(13, 'currentColor')}
            <span>WEBCAM CALIBRATED</span>
          </div>
        </div>

        <div class="dash-top-user">
          <div class="top-streak-badge">
            ${IconFlame(13, 'var(--accent-lime)')}
            <strong>${streak} Hari Streak</strong>
          </div>
          <button class="top-pill" id="btn-top-profile" style="cursor: pointer;" title="Buka Profil">
            ${IconUser(13, 'currentColor')}
            <strong>${escapeHtml(profile.name)}</strong>
          </button>
        </div>
      </header>

      <!-- Main Athletic Hero Banner -->
      <section class="dash-welcome-hero">
        <div class="eyebrow-tag">01 / FitTrack Athletic AI Coach</div>
        <h1 class="dash-welcome-heading">
          Transform Your Body.<br />
          <span>Elevate Your Life.</span>
        </h1>
        <p class="dash-welcome-desc">
          ${timeGreeting}, <strong>${escapeHtml(profile.name)}</strong>. Raih perubahan fisik maksimal dengan panduan kecerdasan buatan MediaPipe real-time, koreksi sudut sendi biomekanik presisi, dan analisis postur 60 FPS tanpa jeda.
        </p>
        <div class="hero-cta-row">
          <button class="btn-giant-cta" id="btn-start-now">
            <span>MULAI LATIHAN SEKARANG</span>
            ${IconArrowRight(15, '#08090A')}
          </button>
          <a href="#/progress" class="btn-hero-secondary">
            ${IconChart(15, 'currentColor')}
            <span>Lihat Riwayat &amp; Analisis</span>
          </a>
        </div>
      </section>

      <!-- Signature Motivational Quote Banner -->
      <section class="dash-quote-banner">
        <blockquote class="quote-text">
          &ldquo;Strength doesn't come from what you can do, it comes from overcoming what you thought you couldn't&rdquo;
        </blockquote>
        <div class="quote-author">// FITTRACK ATHLETIC MOTIVATION</div>
      </section>

      <!-- Stats Showcase Section -->
      <section>
        <div class="eyebrow-tag">Real Results Every Single Day</div>
        <h2 style="font-size: clamp(1.6rem, 2.8vw, 2.2rem); margin-bottom: 16px;">
          Building Strength, One Rep at a Time.
        </h2>

        <!-- 4 Core Metric Cards Grid -->
        <div class="dash-metrics-grid">
          <!-- 1. Total Repetisi -->
          <div class="metric-box-card">
            <div class="metric-header">
              <span class="metric-label">TOTAL REPETISI</span>
              <div class="metric-icon-pill">${IconChart(16, 'var(--accent-lime)')}</div>
            </div>
            <div class="stat-giant-num">
              ${totalReps} <span>reps</span>
            </div>
            <div class="metric-footer">
              <span class="metric-badge-lime">↗ +14%</span>
              <span>vs minggu lalu</span>
            </div>
          </div>

          <!-- 2. Rata-rata Skor Form -->
          <div class="metric-box-card">
            <div class="metric-header">
              <span class="metric-label">SKOR FORM RATA-RATA</span>
              <div class="metric-icon-pill">${IconShield(16, 'var(--accent-lime)')}</div>
            </div>
            <div class="stat-giant-num">
              ${avgScore}<span>%</span>
            </div>
            <div class="metric-footer">
              <span class="metric-badge-lime">● Form Presisi</span>
              <span>33 Keypoints Locked</span>
            </div>
          </div>

          <!-- 3. Kalori Terbakar -->
          <div class="metric-box-card">
            <div class="metric-header">
              <span class="metric-label">KALORI TERBAKAR</span>
              <div class="metric-icon-pill">${IconFlame(16, 'var(--accent-lime)')}</div>
            </div>
            <div class="stat-giant-num">
              ${totalCalories.toLocaleString()} <span>kkal</span>
            </div>
            <div class="metric-footer">
              <span class="metric-badge-lime">72%</span>
              <span>Target Harian Tercapai</span>
            </div>
          </div>

          <!-- 4. Waktu Latihan -->
          <div class="metric-box-card">
            <div class="metric-header">
              <span class="metric-label">WAKTU LATIHAN</span>
              <div class="metric-icon-pill">${IconClock(16, 'var(--accent-lime)')}</div>
            </div>
            <div class="stat-giant-num">
              ${totalHours}
            </div>
            <div class="metric-footer">
              <span class="metric-badge-lime">EFISIEN</span>
              <span>Rata-rata 21 mnt/sesi</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Layout 2-Column: Left (Chart & Activities), Right (Target & Status) -->
      <div class="dash-main-grid">
        <!-- Left Big Column -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- 7-Day Activity Chart Card -->
          <div class="chart-card">
            <div class="card-title-row">
              <div>
                <div class="eyebrow-tag" style="margin-bottom: 2px;">Volume &amp; Konsistensi</div>
                <h3 class="card-title">Aktivitas Repetisi 7 Hari Terakhir</h3>
              </div>
              <div style="display: flex; align-items: center; gap: 14px; font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">
                <span><span style="display:inline-block; width:10px; height:10px; background:#9EF01A; border-radius:2px; margin-right:4px;"></span> Reps Selesai</span>
                <span><span style="display:inline-block; width:10px; height:10px; background:#22D3EE; border-radius:50%; margin-right:4px;"></span> Skor Form</span>
              </div>
            </div>

            <div style="position: relative; height: 200px; width: 100%;">
              <canvas id="dash-weekly-chart"></canvas>
            </div>

            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-family: var(--font-mono);">
              <span style="color: var(--accent-lime); font-weight: 700;">PEAK: SABTU (178 REPS • 94% SCORE)</span>
              <span style="color: var(--text-muted);">TARGET HARIAN HAMPIR TERCAPAI</span>
            </div>
          </div>

          <!-- Recent Sessions Card -->
          <div class="recent-activity-card">
            <div class="card-title-row">
              <div>
                <div class="eyebrow-tag" style="margin-bottom: 2px;">Riwayat Aktivitas</div>
                <h3 class="card-title">Sesi Latihan Terakhir</h3>
              </div>
              <a href="#/progress" style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-lime); font-weight: 700;">
                Lihat Semua →
              </a>
            </div>

            <div class="activity-list">
              ${recentListHTML}
            </div>
          </div>
        </div>

        <!-- Right Sidebar Column -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Daily Target Card -->
          <div class="daily-target-card">
            <div class="card-title-row" style="margin-bottom: 12px;">
              <span class="card-tag">TARGET HARIAN</span>
              ${IconTarget(18, 'var(--accent-lime)')}
            </div>

            <div class="target-ring-container">
              <svg viewBox="0 0 120 120" style="width: 140px; height: 140px; transform: rotate(-90deg);">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-surface-2)" stroke-width="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--accent-lime)"
                  stroke-width="8"
                  stroke-dasharray="314.15"
                  stroke-dashoffset="31.4"
                  stroke-linecap="round"
                />
              </svg>
              <div class="target-ring-center">
                <div class="target-ring-pct">90%</div>
                <div class="target-ring-sub">45 / 50 REPS</div>
              </div>
            </div>

            <p style="font-size: 13px; color: var(--text-muted); text-align: center; margin-top: 10px; line-height: 1.5;">
              Tersisa <strong style="color: #fff;">5 repetisi lagi</strong> untuk menyelesaikan target kebugaran harianmu.
            </p>
          </div>

          <!-- Hardware & Calibration Status -->
          <div class="hardware-checklist-card">
            <div class="card-title-row" style="margin-bottom: 14px;">
              <div>
                <div class="eyebrow-tag" style="margin-bottom: 2px;">Status Teknis</div>
                <h4 style="font-size: 14px; color: #fff;">Sensor Kamera &amp; AI</h4>
              </div>
              <span style="display: inline-block; width: 8px; height: 8px; background: var(--accent-lime); border-radius: 50%; box-shadow: 0 0 8px var(--accent-lime);"></span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; padding: 8px 10px; background: var(--bg-surface-2); border-radius: var(--radius-sm);">
                <span style="display: flex; align-items: center; gap: 8px;">
                  ${IconCamera(14, 'var(--accent-lime)')} Webcam HD Terhubung
                </span>
                <span style="color: var(--accent-lime); font-weight: 700;">AKTIF</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; padding: 8px 10px; background: var(--bg-surface-2); border-radius: var(--radius-sm);">
                <span style="display: flex; align-items: center; gap: 8px;">
                  ${IconInfo(14, 'var(--accent-lime)')} Pencahayaan Ruangan
                </span>
                <span style="color: var(--accent-lime); font-weight: 700;">OPTIMAL</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; padding: 8px 10px; background: var(--bg-surface-2); border-radius: var(--radius-sm);">
                <span style="display: flex; align-items: center; gap: 8px;">
                  ${IconBolt(14, 'var(--accent-lime)')} MediaPipe GPU Accel
                </span>
                <span style="color: var(--accent-lime); font-weight: 700;">60 FPS</span>
              </div>
            </div>
          </div>

          <!-- Biomechanics Tips Card -->
          <div class="tips-coach-card" style="border-left: 3px solid var(--accent-lime);">
            <div class="eyebrow-tag" style="margin-bottom: 4px;">Tips Biomekanik</div>
            <h4 style="font-size: 14px; color: #fff; margin-bottom: 6px;">Sudut Fleksi Squat Presisi</h4>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
              Saat squat, jaga dada tegak dan pastikan sudut lutut mencapai 90° sejajar paha untuk aktivasi maksimal otot quadriceps dan gluteus.
            </p>
            <div style="margin-top: 12px;">
              <a href="#/exercise" style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-lime); font-weight: 700;">
                Pilih Latihan →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Giant Outlined Footer Brand Watermark -->
      <footer class="dash-footer-banner">
        <div class="giant-outline-watermark">GO TO THE GYM NOW</div>
      </footer>
    </div>
  `;
}

export function initHomePage(): void {
  // Start Now CTA
  document.getElementById('btn-start-now')?.addEventListener('click', () => {
    router.navigate('/exercise');
  });

  // Profile click
  document.getElementById('btn-top-profile')?.addEventListener('click', () => {
    router.navigate('/profile');
  });

  // Recent activity click handling
  document.querySelectorAll('.dash-recent-item').forEach(item => {
    item.addEventListener('click', () => {
      router.navigate('/progress');
    });
  });

  // Render weekly chart
  renderWeeklyChart();
}

function renderWeeklyChart(): void {
  const canvas = document.getElementById('dash-weekly-chart') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const labels = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
  const repsData = [65, 80, 45, 110, 95, 178, 55];
  const scoreData = [84, 88, 80, 89, 86, 94, 87];

  import('chart.js').then(({ Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, BarController, LineController, Tooltip, Filler }) => {
    Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, BarController, LineController, Tooltip, Filler);

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(ctx, {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Reps Selesai',
            data: repsData,
            backgroundColor: (context: any) => {
              const i = context.dataIndex;
              // Highlight peak day (Saturday)
              if (i === 5) return '#9EF01A';
              return 'rgba(158, 240, 26, 0.4)';
            },
            borderRadius: 6,
            barThickness: 28,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'Skor Form (%)',
            data: scoreData,
            borderColor: '#22D3EE',
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            pointBackgroundColor: '#22D3EE',
            pointRadius: 4,
            tension: 0.35,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#13161B',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            titleColor: '#FFFFFF',
            bodyColor: '#94A3B8',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94A3B8', font: { size: 11, family: 'Plus Jakarta Sans', weight: 600 } },
            border: { display: false },
          },
          y: {
            display: false,
            beginAtZero: true,
          },
          y1: {
            display: false,
            min: 50,
            max: 100,
          },
        },
      },
    });
  }).catch((err) => {
    console.warn('Chart.js load fallback:', err);
  });
}
