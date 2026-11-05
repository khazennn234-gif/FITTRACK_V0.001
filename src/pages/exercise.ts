// FitTrack — Exercise Selection & Target Configuration Page
// Minimalist Luxury Athletic Aesthetic (Zero casual emojis, clean SVG icons)

import { router } from '../router';
import { getBestReps, getExerciseAvgScore } from '../storage';
import {
  IconCheck,
  IconCamera,
  IconSettings,
  IconTarget,
  IconClock,
  IconInfo,
  IconArrowRight,
  getExerciseIconSvg,
} from '../icons';
import { showToast } from '../toast';

export interface ExerciseInfo {
  id: string;
  name: string;
  category: 'legs' | 'shoulders' | 'arms' | 'cardio';
  musclesGroup: string;
  level: string;
  isRecommended?: boolean;
  biomechanicFocus: string;
  muscleTags: string[];
  statusNote: string;
}

export const EXERCISES: ExerciseInfo[] = [
  {
    id: 'squat',
    name: 'SQUAT',
    category: 'legs',
    musclesGroup: 'PAHA & GLUTES',
    level: 'BEGINNER',
    isRecommended: true,
    biomechanicFocus: 'Fleksi lutut 90°, postur lumbar tegak, sudut ankle optimal.',
    muscleTags: ['Quadriceps', 'Hamstrings', 'Gluteus', 'Core Stability'],
    statusNote: 'Siap untuk Pose Tracking (60 FPS)',
  },
  {
    id: 'pushup',
    name: 'PUSH-UP',
    category: 'arms',
    musclesGroup: 'DADA & TRISEP',
    level: 'INTERMEDIATE',
    biomechanicFocus: 'Ekstensi siku 160° ke fleksi 90°, kestabilan garis spine lurus.',
    muscleTags: ['Pectoralis Major', 'Triceps Brachii', 'Anterior Deltoids', 'Core'],
    statusNote: 'Deteksi Siku & Garis Tubuh',
  },
  {
    id: 'lateral-raise',
    name: 'LATERAL RAISES',
    category: 'shoulders',
    musclesGroup: 'BAHU SAMPING (DELTOID)',
    level: 'BEGINNER',
    isRecommended: true,
    biomechanicFocus: 'Abduksi bahu 80°–95° sejajar lantai, isolasi tanpa ayunan torso.',
    muscleTags: ['Lateral Deltoids', 'Upper Traps', 'Shoulder Girdle Stability'],
    statusNote: 'Bisa Tanpa Beban / Free Hands',
  },
  {
    id: 'shoulder-press',
    name: 'SHOULDER PRESS',
    category: 'shoulders',
    musclesGroup: 'BAHU & TRISEP OVERHEAD',
    level: 'INTERMEDIATE',
    biomechanicFocus: 'Press vertikal overhead dari siku 90° hingga lockout 160°.',
    muscleTags: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps', 'Core Posture'],
    statusNote: 'Overhead Kinematic Tracking',
  },
  {
    id: 'bicep-curl',
    name: 'BICEP CURLS',
    category: 'arms',
    musclesGroup: 'LENGAN DEPAN / BISEP',
    level: 'BEGINNER',
    biomechanicFocus: 'Fleksi siku kontraksi <60°, ekstensi >145°, siku terkunci di samping rusuk.',
    muscleTags: ['Biceps Brachii', 'Brachialis', 'Forearm Flexors'],
    statusNote: 'Isolasi Fleksi Forearm',
  },
  {
    id: 'lunge',
    name: 'LUNGES',
    category: 'legs',
    musclesGroup: 'PAHA & KESEIMBANGAN',
    level: 'INTERMEDIATE',
    biomechanicFocus: 'Fleksi lutut depan 90°, lutut belakang turun stabil, torso tegak.',
    muscleTags: ['Quadriceps', 'Gluteus Medius', 'Hamstrings', 'Unilateral Balance'],
    statusNote: 'Deteksi Lutut Depan',
  },
  {
    id: 'jumping-jack',
    name: 'JUMPING JACK',
    category: 'cardio',
    musclesGroup: 'KARDIO & FULL BODY',
    level: 'BEGINNER',
    biomechanicFocus: 'Sinkronisasi tangan di atas kepala dan pelebaran pijakan kaki berirama.',
    muscleTags: ['Cardiovascular', 'Calves', 'Shoulder Endurance', 'Stamina'],
    statusNote: 'Kalori Cepat Terbakar',
  },
];

// Active State
let selectedExercise: ExerciseInfo = EXERCISES[0];
let targetReps = 15;
let workoutMode: 'target' | 'timer' = 'target';
let poseStrictness: 'easy' | 'normal' | 'strict' = 'normal';

export function getSelectedExercise(): ExerciseInfo {
  return selectedExercise;
}

export function getWorkoutConfig() {
  return {
    exercise: selectedExercise,
    targetReps,
    mode: workoutMode,
    difficulty: poseStrictness,
  };
}

export function renderExercisePage(): string {
  const cardsHTML = EXERCISES.map(ex => {
    const isSelected = selectedExercise.id === ex.id;
    const bestReps = getBestReps(ex.id);
    const avgScore = getExerciseAvgScore(ex.id);

    return `
      <div
        class="ex-select-card ${isSelected ? 'ex-select-card--selected' : ''}"
        data-ex-id="${ex.id}"
        data-category="${ex.category}"
        id="card-ex-${ex.id}"
      >
        <div class="ex-card-header">
          <div class="ex-icon-square">
            ${getExerciseIconSvg(ex.id, 24)}
          </div>
          <div class="ex-header-meta">
            <div class="ex-tag-row">
              <span class="ex-pill-category">${ex.musclesGroup}</span>
              <span class="ex-pill-level">${ex.level}</span>
              ${ex.isRecommended ? '<span class="ex-pill-rec">REKOMENDASI HARI INI</span>' : ''}
            </div>
            <h3 class="ex-title">${ex.name}</h3>
          </div>
          <div class="ex-radio-mark" id="radio-mark-${ex.id}">
            ${isSelected ? IconCheck(16, 'var(--accent-lime)') : '<span style="display:inline-block; width:14px; height:14px; border:1.5px solid var(--text-muted); border-radius:50%;"></span>'}
          </div>
        </div>

        <p class="ex-biomechanic-desc">
          <strong>Fokus Biomekanik:</strong> ${ex.biomechanicFocus}
        </p>

        <!-- Muscle Target Tags -->
        <div class="ex-muscle-tags-row">
          <span class="tag-label">TARGET OTOT:</span>
          ${ex.muscleTags.map(tag => `<span class="muscle-tag">${tag}</span>`).join('')}
        </div>

        <!-- Metrics Row -->
        <div class="ex-card-metrics-row">
          <div class="ex-metric-col">
            <span class="ex-meta-label">PERSONAL BEST</span>
            <span class="ex-meta-val">${bestReps} reps</span>
          </div>
          <div class="ex-metric-col">
            <span class="ex-meta-label">RATA-RATA SKOR</span>
            <span class="ex-meta-val text-success">${avgScore}%</span>
          </div>
          <div class="ex-accuracy-bar-wrapper">
            <div class="accuracy-label-row">
              <span>FORM ACCURACY</span>
              <span class="text-success">${avgScore}%</span>
            </div>
            <div class="accuracy-track">
              <div class="accuracy-fill" style="width: ${avgScore}%;"></div>
            </div>
          </div>
        </div>

        <div class="ex-card-footer-action">
          <span class="ex-status-note" style="display:inline-flex; align-items:center; gap:6px;">
            ${IconCamera(13, 'var(--accent-lime)')}
            <span>${ex.statusNote}</span>
          </span>
          <button type="button" class="btn-select-action" data-ex-id="${ex.id}">
            <span>Atur Target &amp; Mulai</span>
            ${IconArrowRight(13, '#08090A')}
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="exercise-page">
      <!-- Top Badges Header -->
      <header class="dash-top-bar">
        <div class="dash-top-badges">
          <div class="top-pill top-pill--engine">
            <span class="engine-dot">●</span>
            <span>HIGH-PRECISION POSE AI • 7 GERAKAN SIAP</span>
          </div>
        </div>

        <div class="dash-top-user">
          <div class="top-streak-badge">
            <span>SESI HARI INI: <strong>1/3 Selesai</strong></span>
          </div>
          <div class="top-streak-badge" style="border-color:var(--accent-success);">
            <span>RATA-RATA SKOR: <strong class="text-success">88.4%</strong></span>
          </div>
        </div>
      </header>

      <div class="ex-page-headline-row">
        <div>
          <div class="eyebrow-tag">02 / Program Latihan AI</div>
          <h1 class="ex-page-title">Pilih Program Latihan AI</h1>
          <p class="ex-page-subtitle">
            Pilih gerakan tubuh Anda. Algoritma pose MediaPipe menganalisis sudut sendi secara real-time untuk menghitung repetisi dan menilai form gerakan secara akurat.
          </p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="ex-filter-tabs">
        <button class="ex-tab-btn ex-tab-btn--active" data-filter="all">Semua Latihan (${EXERCISES.length})</button>
        <button class="ex-tab-btn" data-filter="shoulders">Otot Bahu</button>
        <button class="ex-tab-btn" data-filter="arms">Lengan &amp; Dada</button>
        <button class="ex-tab-btn" data-filter="legs">Kaki &amp; Paha</button>
        <button class="ex-tab-btn" data-filter="cardio">Kardio &amp; Stamina</button>
      </div>

      <!-- Main 2-Column Grid: Left (Cards), Right (Target Setup Sticky Sidebar) -->
      <div class="exercise-split-grid">
        <!-- Left: Exercise Cards -->
        <div class="exercise-cards-list" id="exercise-cards-container">
          ${cardsHTML}
        </div>

        <!-- Right: Target Configuration Panel (Sticky) -->
        <div class="target-setup-panel">
          <div class="target-panel-card">
            <div class="panel-header-row">
              <h3 class="target-panel-title" style="display:inline-flex; align-items:center; gap:8px;">
                ${IconSettings(16, 'var(--accent-lime)')}
                <span>Pengaturan Target</span>
              </h3>
              <span class="target-step-pill">STEP 1 OF 2</span>
            </div>

            <!-- Selected Exercise Pill -->
            <div class="selected-ex-pill">
              <span class="sel-icon" id="target-sel-icon">
                ${getExerciseIconSvg(selectedExercise.id, 24)}
              </span>
              <div class="sel-info">
                <span class="sel-sub">LATIHAN TERPILIH</span>
                <span class="sel-name" id="target-sel-name">${selectedExercise.name}</span>
              </div>
              <span class="sel-badge text-success">● AI Calibrated</span>
            </div>

            <!-- Mode Latihan -->
            <div class="target-section-block">
              <label class="block-label">MODE LATIHAN</label>
              <div class="mode-toggle-group">
                <button
                  type="button"
                  class="mode-toggle-btn ${workoutMode === 'target' ? 'mode-toggle-btn--active' : ''}"
                  id="btn-mode-target"
                >
                  <span style="display:inline-flex; align-items:center; gap:6px;">
                    ${IconTarget(14, 'currentColor')} Target Repetisi
                  </span>
                </button>
                <button
                  type="button"
                  class="mode-toggle-btn ${workoutMode === 'timer' ? 'mode-toggle-btn--active' : ''}"
                  id="btn-mode-timer"
                >
                  <span style="display:inline-flex; align-items:center; gap:6px;">
                    ${IconClock(14, 'currentColor')} Bebas (Freeform)
                  </span>
                </button>
              </div>
            </div>

            <!-- Rep Stepper & Presets -->
            <div class="target-section-block" id="reps-config-section">
              <div class="block-label-row">
                <label class="block-label">JUMLAH TARGET REPETISI</label>
                <span class="block-sub-tag">PER SET</span>
              </div>

              <!-- Big Stepper -->
              <div class="rep-stepper-row">
                <button type="button" class="btn-stepper" id="btn-rep-minus" aria-label="Kurangi repetisi">−</button>
                <div class="stepper-center-box">
                  <span class="stepper-giant-num" id="stepper-rep-display">${targetReps}</span>
                  <span class="stepper-unit">REPS</span>
                </div>
                <button type="button" class="btn-stepper" id="btn-rep-plus" aria-label="Tambah repetisi">+</button>
              </div>

              <!-- Preset Chips -->
              <div class="preset-chips-row">
                <button type="button" class="chip-preset ${targetReps === 10 ? 'chip-preset--active' : ''}" data-rep="10">10 Reps</button>
                <button type="button" class="chip-preset ${targetReps === 15 ? 'chip-preset--active' : ''}" data-rep="15">15 Reps</button>
                <button type="button" class="chip-preset ${targetReps === 20 ? 'chip-preset--active' : ''}" data-rep="20">20 Reps</button>
                <button type="button" class="chip-preset ${targetReps === 30 ? 'chip-preset--active' : ''}" data-rep="30">30 Reps</button>
              </div>
            </div>

            <!-- Tingkat Ketelitian Sensor AI -->
            <div class="target-section-block">
              <label class="block-label">TINGKAT KETELITIAN SENSOR AI</label>
              <div class="strictness-radios">
                <label class="strictness-option ${poseStrictness === 'easy' ? 'strictness-option--active' : ''}">
                  <input type="radio" name="strictness" value="easy" ${poseStrictness === 'easy' ? 'checked' : ''} />
                  <div class="strictness-info">
                    <span class="strict-name">Santai (Toleransi 15°)</span>
                    <span class="strict-desc">Cocok untuk pemula &amp; pemanasan ringan</span>
                  </div>
                </label>

                <label class="strictness-option ${poseStrictness === 'normal' ? 'strictness-option--active' : ''}">
                  <input type="radio" name="strictness" value="normal" ${poseStrictness === 'normal' ? 'checked' : ''} />
                  <div class="strictness-info">
                    <span class="strict-name">Normal (Standar Akurasi 90°)</span>
                    <span class="strict-desc">Disarankan untuk evaluasi postur harian</span>
                  </div>
                </label>

                <label class="strictness-option ${poseStrictness === 'strict' ? 'strictness-option--active' : ''}">
                  <input type="radio" name="strictness" value="strict" ${poseStrictness === 'strict' ? 'checked' : ''} />
                  <div class="strictness-info">
                    <span class="strict-name">Ketat / Pro Athlete</span>
                    <span class="strict-desc">Memerlukan kedalaman penuh &amp; stabilitas kaku</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- CTA Next Step -->
            <button type="button" class="btn-giant-cta mt-md" id="btn-goto-calibration">
              <span>Lanjut ke Kalibrasi Kamera</span>
              ${IconArrowRight(15, '#08090A')}
            </button>
            <div class="camera-permission-notice">
              KAMERA AKAN AKTIF SETELAH IZIN BROWSER DIBERIKAN
            </div>

            <!-- Tips Posisi Tubuh -->
            <div class="tips-posisi-card mt-md">
              <span class="tip-pin">${IconInfo(15, 'var(--accent-lime)')}</span>
              <div class="tip-txt">
                <strong>Tips Posisi Tubuh:</strong>
                Pastikan tubuh berada dalam bingkai kamera berjarak 1.8 – 2.2 meter dengan pencahayaan cukup.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initExercisePage(): void {
  // Exercise card selection
  const cards = document.querySelectorAll('.ex-select-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const exId = card.getAttribute('data-ex-id');
      const found = EXERCISES.find(e => e.id === exId);
      if (found) {
        selectedExercise = found;
        updateSelectedUI();
        showToast('Program dipilih: ' + found.name, 'info');
      }
    });
  });

  // Action button click handling (with smooth mobile scroll)
  document.querySelectorAll('.btn-select-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const exId = btn.getAttribute('data-ex-id');
      const found = EXERCISES.find(e => e.id === exId);
      if (found) {
        selectedExercise = found;
        updateSelectedUI();
        showToast('Program siap: ' + found.name, 'success');
        if (window.innerWidth < 1024) {
          document.querySelector('.target-setup-panel')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Category filter tabs
  document.querySelectorAll('.ex-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ex-tab-btn').forEach(t => t.classList.remove('ex-tab-btn--active'));
      tab.classList.add('ex-tab-btn--active');
      const filter = tab.getAttribute('data-filter') || 'all';

      document.querySelectorAll('.ex-select-card').forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          (card as HTMLElement).style.display = 'block';
        } else {
          (card as HTMLElement).style.display = 'none';
        }
      });
    });
  });

  // Mode toggles
  document.getElementById('btn-mode-target')?.addEventListener('click', () => {
    workoutMode = 'target';
    document.getElementById('btn-mode-target')?.classList.add('mode-toggle-btn--active');
    document.getElementById('btn-mode-timer')?.classList.remove('mode-toggle-btn--active');
    const repsSection = document.getElementById('reps-config-section');
    if (repsSection) repsSection.style.display = 'flex';
    showToast('Mode: Target Repetisi diaktifkan', 'info');
  });

  document.getElementById('btn-mode-timer')?.addEventListener('click', () => {
    workoutMode = 'timer';
    document.getElementById('btn-mode-timer')?.classList.add('mode-toggle-btn--active');
    document.getElementById('btn-mode-target')?.classList.remove('mode-toggle-btn--active');
    const repsSection = document.getElementById('reps-config-section');
    if (repsSection) repsSection.style.display = 'none';
    showToast('Mode: Bebas (Freeform) diaktifkan', 'info');
  });

  // Rep stepper
  const repDisplay = document.getElementById('stepper-rep-display');
  document.getElementById('btn-rep-minus')?.addEventListener('click', () => {
    targetReps = Math.max(5, targetReps - 5);
    if (repDisplay) repDisplay.textContent = String(targetReps);
    updateChipsUI();
  });

  document.getElementById('btn-rep-plus')?.addEventListener('click', () => {
    targetReps = Math.min(100, targetReps + 5);
    if (repDisplay) repDisplay.textContent = String(targetReps);
    updateChipsUI();
  });

  // Preset chips
  document.querySelectorAll('.chip-preset').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = Number(chip.getAttribute('data-rep')) || 15;
      targetReps = val;
      if (repDisplay) repDisplay.textContent = String(targetReps);
      updateChipsUI();
      showToast('Target diset: ' + targetReps + ' Reps', 'info');
    });
  });

  // Strictness radio
  document.querySelectorAll('input[name="strictness"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      poseStrictness = (e.target as HTMLInputElement).value as any;
      document.querySelectorAll('.strictness-option').forEach(opt => {
        opt.classList.remove('strictness-option--active');
      });
      radio.closest('.strictness-option')?.classList.add('strictness-option--active');
      showToast('Tingkat ketelitian sensor: ' + poseStrictness.toUpperCase(), 'info');
    });
  });

  // Navigate to Calibration
  document.getElementById('btn-goto-calibration')?.addEventListener('click', () => {
    router.navigate('/workout/calibrate');
  });
}

function updateSelectedUI(): void {
  // Update cards active border & radio mark
  document.querySelectorAll('.ex-select-card').forEach(c => {
    const isThis = c.getAttribute('data-ex-id') === selectedExercise.id;
    c.classList.toggle('ex-select-card--selected', isThis);
    const radio = c.querySelector('.ex-radio-mark');
    if (radio) {
      radio.innerHTML = isThis
        ? IconCheck(16, 'var(--accent-lime)')
        : '<span style="display:inline-block; width:14px; height:14px; border:1.5px solid var(--text-muted); border-radius:50%;"></span>';
    }
  });

  // Update right sidebar
  const selIcon = document.getElementById('target-sel-icon');
  const selName = document.getElementById('target-sel-name');
  if (selIcon) selIcon.innerHTML = getExerciseIconSvg(selectedExercise.id, 24);
  if (selName) selName.textContent = selectedExercise.name;
}

function updateChipsUI(): void {
  document.querySelectorAll('.chip-preset').forEach(chip => {
    const val = Number(chip.getAttribute('data-rep'));
    chip.classList.toggle('chip-preset--active', val === targetReps);
  });
}
