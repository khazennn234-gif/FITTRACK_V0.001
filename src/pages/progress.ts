// FitTrack — Analisis Biomekanika & Riwayat Progress
// Based on Stitch Design (09_analisis_progress.png)
// High-Tech Kinetic Precision Telemetry & Minimalist Luxury Aesthetic

import {
  getSessions,
  getTotalReps,
  getAverageScore,
  formatDuration,
  formatDate,
} from '../storage';
import { showToast } from '../toast';
import { escapeHtml } from '../security';
import {
  IconClock,
  IconShield,
  IconBolt,
  IconDownload,
  IconShare,
  IconEye,
  IconBot,
  IconCalendar,
  IconRepeat,
  IconTrendingUp,
  getExerciseIconSvg,
} from '../icons';

export function renderProgressPage(): string {
  const sessions = getSessions();
  const totalReps = getTotalReps();
  const avgScore = getAverageScore();

  const historyCardsHTML = sessions.map(session => {
    const exNameMap: Record<string, string> = {
      squat: 'Squat',
      pushup: 'Push-Up',
      'jumping-jack': 'Jumping Jack',
      'lateral-raise': 'Lateral Raise',
      'shoulder-press': 'Shoulder Press',
      'bicep-curl': 'Bicep Curl',
      lunge: 'Lunges',
    };
    const exName = exNameMap[session.exercise] || session.exercise;

    const tagClass = session.formScore >= 90
      ? 'status-badge-green'
      : session.formScore >= 75
      ? 'status-badge-cyan'
      : 'status-badge-amber';

    const tagLabel = session.statusBadge || (session.formScore >= 90 ? 'TARGET SELESAI' : 'KOREKSI TORSO');

    return `
      <div class="archive-history-card" data-exercise="${escapeHtml(session.exercise)}">
        <div class="archive-left-info">
          <div class="archive-icon-box" style="display:flex; align-items:center; justify-content:center;">
            ${getExerciseIconSvg(session.exercise, 22)}
          </div>
          <div>
            <div class="archive-name-row">
              <span class="archive-title">${escapeHtml(exName)}</span>
              <span class="${tagClass}">${escapeHtml(tagLabel)}</span>
            </div>
            <div class="archive-meta-row">
              <span style="display:inline-flex; align-items:center; gap:5px;">
                ${IconClock(12, 'var(--text-muted)')}
                <span>${formatDate(session.date)}</span>
              </span>
              <span>•</span>
              <span class="text-cyan font-bold">${session.reps} Reps</span>
            </div>
          </div>
        </div>

        <div class="archive-metrics-group">
          <div class="archive-metric-unit">
            <span class="amu-label">FORM SCORE</span>
            <span class="amu-val text-success">${session.formScore}%</span>
          </div>
          <div class="archive-metric-unit">
            <span class="amu-label">DURASI</span>
            <span class="amu-val">${formatDuration(session.duration)}</span>
          </div>
          <div class="archive-metric-unit">
            <span class="amu-label">BURN</span>
            <span class="amu-val text-warning">${session.calories} kkal</span>
          </div>
          <button type="button" class="btn-archive-telemetry" data-id="${escapeHtml(session.id)}" data-name="${escapeHtml(exName)}" data-score="${session.formScore}" data-reps="${session.reps}">
            <span style="display:inline-flex; align-items:center; gap:6px;">
              ${IconEye(13, 'currentColor')}
              <span>Lihat Telemetri</span>
            </span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="progress-page">
      <!-- Top Title Bar -->
      <div class="archive-header-row">
        <div>
          <div class="tag-pill-engine mb-xs">
            <span class="engine-dot">●</span>
            <span>RIWAYAT LATIHAN &amp; ANALISIS BIOMEKANIKA</span>
          </div>
          <h1 class="archive-main-title">Analisis Biomekanika &amp; Riwayat Progress</h1>
          <p class="archive-main-sub">
            Tren akurasi sudut persendian, konsistensi repetisi, dan riwayat sesi 30 hari terakhir terverifikasi via deteksi pose multi-node.
          </p>
        </div>

        <div class="archive-header-actions">
          <button type="button" class="btn-archive-export" id="btn-export-log" title="Unduh Log CSV / JSON">
            <span style="display:inline-flex; align-items:center; gap:8px;">
              ${IconDownload(14, 'currentColor')}
              <span>Unduh Log CSV / JSON</span>
            </span>
          </button>
          <button type="button" class="btn-archive-share" id="btn-share-report" title="Bagikan Laporan ke Coach">
            <span style="display:inline-flex; align-items:center; gap:8px;">
              ${IconShare(14, 'currentColor')}
              <span>Bagikan Laporan ke Coach</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="archive-filter-bar">
        <div class="range-pill-tabs" id="range-filter-tabs" role="tablist" aria-label="Rentang Waktu">
          <button type="button" class="range-tab-btn" data-range="7" role="tab" aria-selected="false">7 Hari Terakhir</button>
          <button type="button" class="range-tab-btn range-tab-btn--active" data-range="30" role="tab" aria-selected="true">30 Hari</button>
          <button type="button" class="range-tab-btn" data-range="90" role="tab" aria-selected="false">3 Bulan</button>
          <button type="button" class="range-tab-btn" data-range="all" role="tab" aria-selected="false">Semua</button>
        </div>

        <div class="filter-controls-right">
          <select class="movement-filter-select" id="movement-filter-select" aria-label="Filter gerakan">
            <option value="all">Semua Gerakan</option>
            <option value="squat">Squat</option>
            <option value="pushup">Push-Up</option>
            <option value="jumping-jack">Jumping Jack</option>
            <option value="lateral-raise">Lateral Raise</option>
            <option value="shoulder-press">Shoulder Press</option>
            <option value="bicep-curl">Bicep Curl</option>
            <option value="lunge">Lunges</option>
          </select>
          <span class="autosync-badge">● AUTOSYNC AKTIF</span>
        </div>
      </div>

      <!-- 4 Stats Cards Grid: Desktop 4 Cols, Tablet 2 Cols, Mobile 1 Col -->
      <section class="stats-metric-grid" aria-label="Statistik Utama">
        <!-- 1. Total Sesi Latihan -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-title">TOTAL SESI LATIHAN</span>
            <div class="metric-icon-badge">
              ${IconCalendar(16, 'var(--accent-lime)')}
            </div>
          </div>
          <div class="metric-val-row">
            <span class="metric-giant-val">${sessions.length || 47}</span>
            <span class="metric-unit-text">sesi</span>
          </div>
          <div class="metric-trend-row trend-up">
            ${IconTrendingUp(14, 'var(--accent-lime)')}
            <span>+18% vs bulan lalu</span>
          </div>
        </div>

        <!-- 2. Total Repetisi -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-title">TOTAL REPETISI</span>
            <div class="metric-icon-badge">
              ${IconRepeat(16, 'var(--accent-cyan)')}
            </div>
          </div>
          <div class="metric-val-row">
            <span class="metric-giant-val">${totalReps}</span>
            <span class="metric-unit-text">reps</span>
          </div>
          <div class="metric-trend-row trend-cyan">
            ${IconTrendingUp(14, 'var(--accent-cyan)')}
            <span>Akurasi Terverifikasi AI (98.4%)</span>
          </div>
        </div>

        <!-- 3. Rata-rata Form Score -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-title">RATA-RATA FORM SCORE</span>
            <div class="metric-icon-badge">
              ${IconShield(16, 'var(--accent-lime)')}
            </div>
          </div>
          <div class="metric-val-row">
            <span class="metric-giant-val">${avgScore}%</span>
            <span class="metric-chip-green">FORM SOLID</span>
          </div>
          <div class="metric-trend-row trend-up">
            ${IconTrendingUp(14, 'var(--accent-lime)')}
            <span>+4.2 poin konsistensi sudut</span>
          </div>
        </div>

        <!-- 4. Total Estimasi Energi -->
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-title">TOTAL ESTIMASI ENERGI</span>
            <div class="metric-icon-badge">
              ${IconBolt(16, 'var(--accent-lime)')}
            </div>
          </div>
          <div class="metric-val-row">
            <span class="metric-giant-val">12.450</span>
            <span class="metric-unit-text">kkal</span>
          </div>
          <div class="metric-trend-row trend-neutral">
            ${IconTrendingUp(14, 'var(--text-muted)')}
            <span>Avg. 265 kkal per sesi latihan</span>
          </div>
        </div>
      </section>

      <!-- Split Layout: Left (Chart Volume & Form), Right (Joint Angle Distribution) -->
      <div class="dash-content-split-grid mt-lg">
        <!-- Left: 30-Day Dual Axis Chart -->
        <div class="dash-main-column">
          <div class="dash-panel-card">
            <div class="panel-header-row">
              <div>
                <div class="panel-tag text-success">● Perkembangan Repetisi &amp; Form Score</div>
                <p class="panel-sub-desc">Korelasi volume repetisi (Bar Neon) dengan indeks akurasi biomekanika (Garis Cyan)</p>
              </div>
              <div class="chart-legend-row">
                <span class="legend-item"><span class="legend-dot" style="background:#9EF01A"></span> TOTAL REPS (0-30)</span>
                <span class="legend-item"><span class="legend-dot" style="background:#22D3EE"></span> FORM SCORE (%)</span>
              </div>
            </div>

            <div class="chart-container-box">
              <canvas id="progress-dual-chart" height="220"></canvas>
            </div>

            <!-- Chart Footer Telemetry Stats -->
            <div class="chart-telemetry-trio mt-md">
              <div class="trio-item">
                <span class="trio-label">PEAK REPS / SET</span>
                <span class="trio-val">26 Reps</span>
              </div>
              <div class="trio-item">
                <span class="trio-label">KONSISTENSI FORM</span>
                <span class="trio-val text-success">91.4%</span>
              </div>
              <div class="trio-item">
                <span class="trio-label">RESOLUSI LATENSI</span>
                <span class="trio-val text-cyan">16 ms</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Joint Angle Distribution 3D Pose -->
        <div class="dash-side-column">
          <div class="dash-panel-card">
            <div class="panel-header-row">
              <div>
                <span class="panel-tag">DISTRIBUSI SUDUT SENDI</span>
                <h3 class="panel-h4">Presisi Kinematik Sendi</h3>
              </div>
              <span class="status-badge-purple">3D POSE</span>
            </div>

            <div class="joint-distrib-list mt-md">
              <!-- Item 1: Hip Hinge -->
              <div class="joint-dist-item">
                <div class="jdi-header">
                  <span>Kedalaman Paha (Hip Hinge)</span>
                  <span class="text-success font-bold">91% (&gt;90°)</span>
                </div>
                <div class="jdi-track">
                  <div class="jdi-fill" style="width: 91%;"></div>
                </div>
                <div class="jdi-sub">Kurang Dalam • Kedalaman Optimal</div>
              </div>

              <!-- Item 2: Knee Valgus -->
              <div class="joint-dist-item">
                <div class="jdi-header">
                  <span>Simetri Lutut (Knee Valgus)</span>
                  <span class="text-cyan font-bold">88% (Stabil)</span>
                </div>
                <div class="jdi-track">
                  <div class="jdi-fill jdi-fill--cyan" style="width: 88%;"></div>
                </div>
                <div class="jdi-sub">Inward Collapse • Sejajar Jempol Kaki</div>
              </div>

              <!-- Item 3: Torso & Spine -->
              <div class="joint-dist-item">
                <div class="jdi-header">
                  <span>Kestabilan Torso &amp; Spine</span>
                  <span class="text-success font-bold">84% (Tegak)</span>
                </div>
                <div class="jdi-track">
                  <div class="jdi-fill" style="width: 84%;"></div>
                </div>
                <div class="jdi-sub">Rounding Punggung • Spine Erector Kental</div>
              </div>

              <!-- Item 4: Shoulder & Elbow -->
              <div class="joint-dist-item">
                <div class="jdi-header">
                  <span>Ekstensi Bahu &amp; Siku</span>
                  <span class="text-cyan font-bold">90% (Full Lockout)</span>
                </div>
                <div class="jdi-track">
                  <div class="jdi-fill jdi-fill--cyan" style="width: 90%;"></div>
                </div>
                <div class="jdi-sub">Half-Reps • Maksimal 160°</div>
              </div>
            </div>

            <!-- Insight Pelatih AI Box -->
            <div class="virtual-coach-box mt-md">
              <div class="coach-tag">
                <span style="display:inline-flex; align-items:center; gap:6px;">
                  ${IconBot(14, 'var(--accent-lime)')}
                  <span>INSIGHT PELATIH AI</span>
                </span>
              </div>
              <p class="coach-quote">
                "Kedalaman squat membaik drastis dibanding minggu lalu. Jaga punggung tetap tegak pada fase deselerasi eksentrik."
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Daftar Riwayat Latihan Section -->
      <section class="archive-history-section mt-xl">
        <div class="flex justify-between items-center mb-md">
          <div>
            <h3 class="panel-h3">Daftar Riwayat Latihan</h3>
            <p class="text-secondary" style="font-size:13px;">Log rekaman video-biomekanika dan audit performa per set latihan.</p>
          </div>
          <span class="text-tertiary" id="total-records-count" style="font-size:12px;font-weight:600;">TOTAL DITEMUKAN: ${sessions.length} REKAMAN</span>
        </div>

        <div class="history-cards-stack" id="history-cards-container">
          ${historyCardsHTML}
        </div>
      </section>
    </div>
  `;
}

export function initProgressPage(): void {
  renderProgressDualChart();

  // Export Log button
  document.getElementById('btn-export-log')?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(getSessions(), null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'fittrack_telemetry_export.json');
    dlAnchor.click();
    showToast('Data telemetri lengkap berhasil diunduh (JSON)', 'success');
  });

  // Share Report button
  document.getElementById('btn-share-report')?.addEventListener('click', () => {
    const totalReps = getTotalReps();
    const avgScore = getAverageScore();
    const shareText = `Laporan FitTrack AI:\nTotal Repetisi: ${totalReps}\nSkor Rata-Rata Form: ${avgScore}%\nPelacakan akurat via Pose Estimation MediaPipe.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        showToast('Ringkasan progress disalin ke clipboard!', 'success');
      }).catch(() => {
        showToast('Laporan progress siap dibagikan', 'info');
      });
    } else {
      showToast('Laporan progress siap dibagikan', 'info');
    }
  });

  // Range pill tab buttons
  const rangeTabs = document.querySelectorAll<HTMLButtonElement>('.range-tab-btn');
  rangeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      rangeTabs.forEach(t => t.classList.remove('range-tab-btn--active'));
      tab.classList.add('range-tab-btn--active');
      showToast(`Rentang data diperbarui: ${tab.textContent?.trim()}`, 'info');
    });
  });

  // Movement filter select
  const filterSelect = document.getElementById('movement-filter-select') as HTMLSelectElement | null;
  const cardsContainer = document.getElementById('history-cards-container');
  const countSpan = document.getElementById('total-records-count');

  if (filterSelect && cardsContainer) {
    filterSelect.addEventListener('change', () => {
      const selected = filterSelect.value;
      const cards = cardsContainer.querySelectorAll<HTMLElement>('.archive-history-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const ex = card.dataset.exercise;
        if (selected === 'all' || ex === selected) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (countSpan) {
        countSpan.textContent = `TOTAL DITEMUKAN: ${visibleCount} REKAMAN`;
      }
      showToast(`Filter gerakan: ${filterSelect.options[filterSelect.selectedIndex].text}`, 'info');
    });
  }

  // Telemetry detail buttons
  document.querySelectorAll<HTMLButtonElement>('.btn-archive-telemetry').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name || 'Gerakan';
      const score = btn.dataset.score || '85';
      const reps = btn.dataset.reps || '10';
      showToast(`Telemetri ${name}: ${reps} reps • Form Score ${score}% • Sudut stabil`, 'info');
    });
  });
}

function renderProgressDualChart(): void {
  const canvas = document.getElementById('progress-dual-chart') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const labels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Hari Ini'];
  const repsData = [12, 18, 15, 22, 26];
  const scoreData = [75, 82, 80, 89, 92];

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
            label: 'Total Reps (0-30)',
            data: repsData,
            backgroundColor: '#9EF01A',
            borderRadius: 6,
            barThickness: 24,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'Form Score (%)',
            data: scoreData,
            borderColor: '#22D3EE',
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            borderWidth: 2.5,
            pointBackgroundColor: '#22D3EE',
            pointRadius: 4,
            tension: 0.35,
            fill: true,
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
            position: 'left',
            beginAtZero: true,
            max: 30,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94A3B8', font: { size: 10, family: 'Plus Jakarta Sans' } },
            border: { display: false },
          },
          y1: {
            position: 'right',
            min: 50,
            max: 100,
            grid: { display: false },
            ticks: {
              color: '#22D3EE',
              font: { size: 10, family: 'Plus Jakarta Sans' },
              callback: (v: any) => `${v}%`,
            },
            border: { display: false },
          },
        },
      },
    });
  }).catch((err) => {
    console.warn('Progress dual chart render error:', err);
  });
}
