// FitTrack — Session Summary & Analysis Page
// Based on Stitch Design (08_ringkasan_sesi.png)
// High-Tech Kinetic Precision Telemetry & Minimalist Luxury Aesthetic

import { router } from '../router';
import { getProfile, formatDuration, type WorkoutSession } from '../storage';
import { showToast } from '../toast';
import { escapeHtml } from '../security';
import {
  IconTarget,
  IconTrophy,
  IconChart,
  IconClock,
  IconFlame,
  IconShield,
  IconCheck,
  IconAlert,
  IconBot,
  IconRotate,
} from '../icons';

export function renderSummaryPage(): string {
  const profile = getProfile();
  const session: WorkoutSession | undefined = (window as any).__lastSession;

  const reps = session ? session.reps : 15;
  const targetReps = session ? session.targetReps : 15;
  const durationSec = session ? session.duration : 154; // 2m 34s
  const calories = session ? session.calories : 42;
  const formScore = session ? session.formScore : 87;
  const exerciseName = session
    ? session.exercise.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Squat';

  const goodRepsCount = session ? session.goodReps : 13;
  const badRepsCount = session ? session.badReps : 2;

  const scoreLabel = formScore >= 90 ? 'LUAR BIASA' : formScore >= 75 ? 'PRESISI TINGGI' : 'CUKUP BAIK';

  return `
    <div class="summary-page">
      <!-- Top Action Navigation -->
      <div class="summary-top-nav">
        <button type="button" class="btn-summary-back" id="btn-back-dash">
          ← Kembali ke Dashboard
        </button>
        <div class="summary-nav-tags">
          <span class="tag-pill-green">● VISION TELEMETRY STORED</span>
          <span class="tag-pill-time">HARI INI, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
        </div>
      </div>

      <!-- Celebratory Banner Card -->
      <section class="summary-celebration-card">
        <div class="celeb-text-col">
          <div class="celeb-tag">
            <span class="celeb-icon" style="display:inline-flex; align-items:center;">${IconTarget(14, 'currentColor')}</span>
            <span>SESI ${exerciseName.toUpperCase()} BERHASIL • AI VISION V2.4</span>
          </div>
          <h1 class="celeb-heading">LATIHAN SELESAI</h1>
          <p class="celeb-subtext">
            Hebat, ${escapeHtml(profile.name)}! Anda menyelesaikan target ${reps} repetisi ${escapeHtml(exerciseName)} dengan akurasi kinematik tinggi dan stabilitas postur konsisten.
          </p>
        </div>

        <div class="celeb-badge-box">
          <div class="xp-badge-icon" style="display:flex; align-items:center; justify-content:center;">${IconTrophy(24, 'var(--accent-lime)')}</div>
          <div>
            <div class="xp-gain-label">LEVEL UP! +350 XP</div>
            <div class="xp-title">Master of ${exerciseName}s</div>
            <div class="xp-meta">Rank Tier II • Kinetic Accuracy</div>
          </div>
        </div>
      </section>

      <!-- 4 Core Metric Stat Boxes -->
      <section class="summary-metric-grid">
        <div class="sum-stat-card">
          <div class="sum-stat-top">
            <span class="sum-stat-label">REPETISI</span>
            <span class="sum-stat-icon">${IconChart(16, 'var(--text-muted)')}</span>
          </div>
          <div class="sum-stat-val">
            <span>${reps}</span><span class="sum-stat-sub">/${targetReps}</span>
          </div>
          <div class="sum-stat-note text-success">● 100% Target Tercapai</div>
        </div>

        <div class="sum-stat-card">
          <div class="sum-stat-top">
            <span class="sum-stat-label">DURASI LATIHAN</span>
            <span class="sum-stat-icon">${IconClock(16, 'var(--text-muted)')}</span>
          </div>
          <div class="sum-stat-val">
            ${formatDuration(durationSec)}
          </div>
          <div class="sum-stat-note text-cyan">Tempo Ideal 2.1s / rep</div>
        </div>

        <div class="sum-stat-card">
          <div class="sum-stat-top">
            <span class="sum-stat-label">ESTIMASI KALORI</span>
            <span class="sum-stat-icon">${IconFlame(16, 'var(--accent-lime)')}</span>
          </div>
          <div class="sum-stat-val">
            <span>${calories}</span><span class="sum-stat-sub">kkal</span>
          </div>
          <div class="sum-stat-note text-success">↗ +8% vs sesi sebelumnya</div>
        </div>

        <div class="sum-stat-card">
          <div class="sum-stat-top">
            <span class="sum-stat-label">RATA-RATA SKOR FORM</span>
            <span class="sum-stat-icon">${IconShield(16, 'var(--text-muted)')}</span>
          </div>
          <div class="sum-stat-val">
            <span>${formScore}</span><span class="sum-stat-sub">%</span>
          </div>
          <div class="sum-stat-note text-success">● Bagus &amp; Konsisten</div>
        </div>
      </section>

      <!-- 2-Column Split: Left (Score Ring & Coach Insight), Right (Feedback Telemetry Log) -->
      <div class="summary-content-grid">
        <!-- Left Column: Circular Form Ring & Coach Box -->
        <div class="sum-left-col">
          <div class="dash-panel-card">
            <div class="panel-header-row">
              <div>
                <span class="panel-tag">COMPUTER VISION ANALYSIS</span>
                <h3 class="panel-h3">Skor Postur &amp; Sudut Sendi</h3>
              </div>
              <span class="status-badge-green">HIGH ACCURACY</span>
            </div>

            <!-- SVG Score Ring -->
            <div class="score-ring-centered">
              <svg viewBox="0 0 160 160" class="score-ring-svg">
                <circle cx="80" cy="80" r="68" class="ring-track-circle" />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  class="ring-fill-circle"
                  id="summary-ring-fill"
                  style="stroke-dashoffset: ${427 - (427 * formScore) / 100};"
                />
              </svg>
              <div class="score-ring-content">
                <span class="ring-number" id="sum-score-display">${formScore}%</span>
                <span class="ring-label">${scoreLabel}</span>
              </div>
            </div>

            <div class="ring-sub-note">
              Deviasi Sudut: <strong class="text-cyan">±3.4°</strong>
            </div>

            <!-- Breakdown Bars -->
            <div class="movement-breakdown-list mt-md">
              <div class="distrib-label">DISTRIBUSI KUALITAS GERAKAN</div>

              <div class="distrib-item">
                <span class="distrib-dot text-success" style="display:inline-flex; align-items:center;">${IconCheck(14, 'var(--accent-lime)')}</span>
                <div class="distrib-info">
                  <div class="distrib-title">${goodRepsCount} Repetisi Sempurna</div>
                  <div class="distrib-sub">Sudut Kedalaman Paha 90° - 100°</div>
                </div>
                <span class="distrib-pct text-success">86.7%</span>
              </div>

              <div class="distrib-item">
                <span class="distrib-dot text-warning" style="display:inline-flex; align-items:center;">${IconAlert(14, 'var(--accent-warning)')}</span>
                <div class="distrib-info">
                  <div class="distrib-title">${badRepsCount} Repetisi Perlu Perbaikan</div>
                  <div class="distrib-sub">Kemiringan torso &amp; kedalaman parsial</div>
                </div>
                <span class="distrib-pct text-warning">13.3%</span>
              </div>
            </div>

            <!-- Virtual AI Coach Insights Box -->
            <div class="virtual-coach-box mt-lg">
              <div class="coach-tag">
                <span style="display:inline-flex; align-items:center; gap:6px;">
                  ${IconBot(14, 'var(--accent-lime)')}
                  <span>VIRTUAL AI COACH INSIGHTS</span>
                </span>
              </div>
              <p class="coach-quote">
                "Form Anda sangat stabil pada repetisi 1–6. Mulai repetisi 10 ke atas, terjadi sedikit kemiringan panggul akibat kelelahan muscular. Fokus pada ritme pernapasan saat fase eksentrik (turun)."
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Kinematic Telemetry Feed / Rep-by-Rep Log -->
        <div class="sum-right-col">
          <div class="dash-panel-card">
            <div class="panel-header-row">
              <div>
                <span class="panel-tag">KINEMATIC TELEMETRY FEED</span>
                <h3 class="panel-h3">Detail Feedback Log per Repetisi</h3>
              </div>
              <span class="status-indicator-green">● FULL TRACK</span>
            </div>

            <div class="telemetry-log-feed">
              <!-- Item 1: Rep 1-6 -->
              <div class="log-card log-card--success">
                <div class="log-top-row">
                  <span class="log-rep-tag" style="display:inline-flex; align-items:center; gap:5px;">
                    ${IconCheck(12, 'currentColor')} Rep 1–6
                  </span>
                  <span class="log-status-tag text-success">OPTIMAL • 96% SCORE</span>
                </div>
                <p class="log-desc">
                  Form sangat stabil, lutut sejajar dengan ujung kaki, dan kedalaman paha tepat pada sudut 92°.
                </p>
              </div>

              <!-- Item 2: Rep 7 -->
              <div class="log-card log-card--warning">
                <div class="log-top-row">
                  <span class="log-rep-tag" style="display:inline-flex; align-items:center; gap:5px;">
                    ${IconAlert(12, 'currentColor')} Rep 7
                  </span>
                  <span class="log-status-tag text-warning">KEDALAMAN KURANG • 76%</span>
                </div>
                <p class="log-desc">
                  Turun 5° lebih dalam untuk aktivasi paha depan &amp; gluteus maksimal. Sudut terhenti di 84°.
                </p>
              </div>

              <!-- Item 3: Rep 8-10 -->
              <div class="log-card log-card--success">
                <div class="log-top-row">
                  <span class="log-rep-tag" style="display:inline-flex; align-items:center; gap:5px;">
                    ${IconCheck(12, 'currentColor')} Rep 8–10
                  </span>
                  <span class="log-status-tag text-success">TERKOREKSI • 94% SCORE</span>
                </div>
                <p class="log-desc">
                  Kembali ke postur prima. Keseimbangan pusat gravitasi tepat di tengah telapak kaki.
                </p>
              </div>

              <!-- Item 4: Rep 11 -->
              <div class="log-card log-card--warning">
                <div class="log-top-row">
                  <span class="log-rep-tag" style="display:inline-flex; align-items:center; gap:5px;">
                    ${IconAlert(12, 'currentColor')} Rep 11
                  </span>
                  <span class="log-status-tag text-warning">KEMIRINGAN TORSO • 72%</span>
                </div>
                <p class="log-desc">
                  Dada sedikit condong ke depan saat transisi naik. Kunci otot inti perut lebih kuat.
                </p>
              </div>

              <!-- Item 5: Rep 12-15 -->
              <div class="log-card log-card--success">
                <div class="log-top-row">
                  <span class="log-rep-tag" style="display:inline-flex; align-items:center; gap:5px;">
                    ${IconCheck(12, 'currentColor')} Rep 12–15
                  </span>
                  <span class="log-status-tag text-success">FINISHING KUAT • 91% SCORE</span>
                </div>
                <p class="log-desc">
                  Penutupan set yang solid dan presisi tinggi dengan kontrol kontraksi sempurna hingga repetisi terakhir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Trend Sparkline Banner -->
      <div class="weekly-trend-banner mt-lg">
        <div class="wt-left">
          <span class="wt-icon" style="display:flex; align-items:center; justify-content:center;">${IconChart(22, 'var(--accent-lime)')}</span>
          <div>
            <div class="wt-tag text-success">PROGRESS LATIHAN TERKINI • +12% KONSISTENSI PEKAN INI</div>
            <div class="wt-title">Tren Akurasi Postur Latihan Mingguan</div>
            <div class="wt-desc">Dari 4 sesi ${exerciseName.toLowerCase()} terakhir, rata-rata skor meningkat dari 75% ke ${formScore}%.</div>
          </div>
        </div>

        <div class="wt-right">
          <div class="wt-points">
            <span>75%</span> → <span>81%</span> → <span>82%</span> → <strong class="text-success">${formScore}%</strong>
          </div>
          <svg viewBox="0 0 100 24" class="trend-spark-svg">
            <polyline points="0,20 30,14 60,12 100,2" fill="none" stroke="#9EF01A" stroke-width="2.5" />
            <circle cx="100" cy="2" r="3.5" fill="#9EF01A" />
          </svg>
        </div>
      </div>

      <!-- Bottom Action Buttons -->
      <div class="summary-bottom-actions mt-xl">
        <button type="button" class="btn-summary-repeat" id="btn-sum-repeat">
          <span style="display:inline-flex; align-items:center; gap:8px;">
            ${IconRotate(16, 'currentColor')}
            <span>Ulangi Sesi Ini</span>
          </span>
        </button>
        <button type="button" class="btn-summary-home" id="btn-sum-home">
          <span style="display:inline-flex; align-items:center; gap:8px;">
            ${IconCheck(16, 'currentColor')}
            <span>Simpan &amp; Kembali ke Dashboard</span>
          </span>
        </button>
      </div>
    </div>
  `;
}

export function initSummaryPage(): void {
  // Navigation buttons
  document.getElementById('btn-back-dash')?.addEventListener('click', () => {
    router.navigate('/');
  });

  document.getElementById('btn-sum-home')?.addEventListener('click', () => {
    showToast('Sesi latihan berhasil tersimpan di arsip riwayat', 'success');
    setTimeout(() => {
      router.navigate('/');
    }, 350);
  });

  document.getElementById('btn-sum-repeat')?.addEventListener('click', () => {
    showToast('Menyiapkan kalibrasi sensor ulang...', 'info');
    setTimeout(() => {
      router.navigate('/workout/calibrate');
    }, 300);
  });
}
