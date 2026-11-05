// FitTrack — User Physical Information & Onboarding Page
// Collects Body Metrics (Height, Weight, Age, BMI, Exercise Focus, Fitness Level)
// Minimalist Luxury Aesthetic with Vector SVG Icons

import { router } from '../router';
import { getProfile, saveProfile, calculateBMI } from '../storage';
import { showToast } from '../toast';
import {
  IconUser,
  IconShield,
  IconBolt,
  IconTarget,
  IconFlame,
  IconArrowRight,
  getExerciseIconSvg,
} from '../icons';

export function renderOnboardingPage(): string {
  const profile = getProfile();
  const { bmi, status } = calculateBMI(profile.height, profile.weight);

  return `
    <div class="auth-page auth-page--onboarding">
      <div class="onboarding-card">
        <!-- Progress Stepper Header -->
        <div class="onboarding-stepper-header">
          <div class="step-badge">
            <span class="step-num">LANGKAH 2 DARI 2</span>
            <span class="step-divider">•</span>
            <span class="step-topic">PARAMETER BIOMETRIK</span>
          </div>
          <div class="stepper-progress-bar">
            <div class="stepper-progress-fill" style="width: 100%;"></div>
          </div>
        </div>

        <div class="onboarding-header">
          <h1 class="onboarding-title">Lengkapi Data Biometrik Atlet</h1>
          <p class="onboarding-subtitle">
            Algoritma MediaPipe Pose memerlukan parameter fisik Anda untuk menormalisasi panjang segmen femur, tibia, dan rasio sudut torso secara akurat.
          </p>
        </div>

        <form id="form-onboarding" onsubmit="return false;">
          <!-- Section 1: Pengukuran Fisik -->
          <div class="onboard-section">
            <div class="onboard-section-title" style="display:flex; align-items:center; gap:8px;">
              ${IconUser(15, 'var(--accent-lime)')}
              <span>UKURAN FISIK &amp; BODY MASS</span>
            </div>

            <div class="grid-3 gap-md">
              <!-- Tinggi Badan -->
              <div class="metric-input-card">
                <label for="input-ob-height">Tinggi Badan</label>
                <div class="metric-input-inner">
                  <input
                    type="number"
                    id="input-ob-height"
                    class="metric-number-input"
                    value="${profile.height || 170}"
                    min="120"
                    max="220"
                    required
                  />
                  <span class="metric-unit">cm</span>
                </div>
              </div>

              <!-- Berat Badan -->
              <div class="metric-input-card">
                <label for="input-ob-weight">Berat Badan</label>
                <div class="metric-input-inner">
                  <input
                    type="number"
                    id="input-ob-weight"
                    class="metric-number-input"
                    value="${profile.weight || 65}"
                    min="30"
                    max="200"
                    required
                  />
                  <span class="metric-unit">kg</span>
                </div>
              </div>

              <!-- Usia -->
              <div class="metric-input-card">
                <label for="input-ob-age">Usia</label>
                <div class="metric-input-inner">
                  <input
                    type="number"
                    id="input-ob-age"
                    class="metric-number-input"
                    value="${profile.age || 25}"
                    min="12"
                    max="90"
                    required
                  />
                  <span class="metric-unit">thn</span>
                </div>
              </div>
            </div>

            <!-- Dynamic Live BMI Calculator Badge -->
            <div class="bmi-live-banner mt-md" id="bmi-banner">
              <div class="bmi-left">
                <span class="bmi-icon" style="display:flex; align-items:center; justify-content:center;">
                  ${IconShield(16, 'var(--accent-lime)')}
                </span>
                <div>
                  <div class="bmi-title">ESTIMASI INDEKS MASSA TUBUH (BMI)</div>
                  <div class="bmi-formula-desc">Dihitung otomatis untuk normalisasi beban sendi kinetik</div>
                </div>
              </div>
              <div class="bmi-right">
                <span class="bmi-score" id="bmi-val">${bmi}</span>
                <span class="bmi-status-tag" id="bmi-status">${status}</span>
              </div>
            </div>
          </div>

          <!-- Section 2: Tingkat Kebugaran Atlet -->
          <div class="onboard-section mt-lg">
            <div class="onboard-section-title" style="display:flex; align-items:center; gap:8px;">
              ${IconBolt(15, 'var(--accent-lime)')}
              <span>TINGKAT KEBUGARAN SAAT INI</span>
            </div>

            <div class="level-cards-grid">
              <div class="level-card ${profile.fitnessLevel === 'beginner' ? 'level-card--active' : ''}" data-level="beginner">
                <div class="level-badge">PEMULA</div>
                <div class="level-title">Toleransi Luas (±110° Squat)</div>
                <div class="level-desc">Fokus membangun mobilitas dan pembiasaan postur tanpa cedera.</div>
              </div>

              <div class="level-card ${profile.fitnessLevel === 'intermediate' ? 'level-card--active' : ''}" data-level="intermediate">
                <div class="level-badge level-badge--rec">DISARANKAN</div>
                <div class="level-title">Intermediate (90° Paralel)</div>
                <div class="level-desc">Standar MediaPipe AI, menguji kedalaman dan simetri sendi optimal.</div>
              </div>

              <div class="level-card ${profile.fitnessLevel === 'advanced' ? 'level-card--active' : ''}" data-level="advanced">
                <div class="level-badge">PRO ATLET</div>
                <div class="level-title">Ketat / Strict (&lt;80° ATG)</div>
                <div class="level-desc">Penilaian presisi tinggi kompetisi atletik dan biomekanika ketat.</div>
              </div>
            </div>
          </div>

          <!-- Section 3: Jenis Latihan Utama -->
          <div class="onboard-section mt-lg">
            <div class="onboard-section-title" style="display:flex; align-items:center; gap:8px;">
              ${IconTarget(15, 'var(--accent-lime)')}
              <span>FOKUS LATIHAN UTAMA</span>
            </div>

            <div class="exercise-focus-grid">
              <div class="focus-chip focus-chip--active" data-focus="squat">
                <span class="chip-icon" style="display:flex; align-items:center;">${getExerciseIconSvg('squat', 18)}</span>
                <div>
                  <div class="chip-name">Squat</div>
                  <div class="chip-sub">Paha, Glutes, Core</div>
                </div>
              </div>

              <div class="focus-chip" data-focus="pushup">
                <span class="chip-icon" style="display:flex; align-items:center;">${getExerciseIconSvg('pushup', 18)}</span>
                <div>
                  <div class="chip-name">Push-Up</div>
                  <div class="chip-sub">Dada, Bahu, Trisep</div>
                </div>
              </div>

              <div class="focus-chip" data-focus="lateral-raise">
                <span class="chip-icon" style="display:flex; align-items:center;">${getExerciseIconSvg('lateral-raise', 18)}</span>
                <div>
                  <div class="chip-name">Lateral Raises</div>
                  <div class="chip-sub">Bahu Samping, Deltoid</div>
                </div>
              </div>

              <div class="focus-chip" data-focus="shoulder-press">
                <span class="chip-icon" style="display:flex; align-items:center;">${getExerciseIconSvg('shoulder-press', 18)}</span>
                <div>
                  <div class="chip-name">Shoulder Press</div>
                  <div class="chip-sub">Overhead, Bahu &amp; Trisep</div>
                </div>
              </div>

              <div class="focus-chip" data-focus="bicep-curl">
                <span class="chip-icon" style="display:flex; align-items:center;">${getExerciseIconSvg('bicep-curl', 18)}</span>
                <div>
                  <div class="chip-name">Bicep Curls</div>
                  <div class="chip-sub">Lengan Depan, Forearm</div>
                </div>
              </div>

              <div class="focus-chip" data-focus="jumping-jack">
                <span class="chip-icon" style="display:flex; align-items:center;">${getExerciseIconSvg('jumping-jack', 18)}</span>
                <div>
                  <div class="chip-name">Jumping Jack</div>
                  <div class="chip-sub">Kardio, Full Body, Stamina</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Target Repetisi Harian -->
          <div class="onboard-section mt-lg">
            <div class="onboard-section-title" style="display:flex; align-items:center; gap:8px;">
              ${IconFlame(15, 'var(--accent-lime)')}
              <span>TARGET REPETISI HARIAN</span>
            </div>

            <div class="daily-target-selector">
              <button type="button" class="target-rep-chip" data-target="30">30 Reps / Hari</button>
              <button type="button" class="target-rep-chip target-rep-chip--active" data-target="50">50 Reps (Optimal)</button>
              <button type="button" class="target-rep-chip" data-target="75">75 Reps</button>
              <button type="button" class="target-rep-chip" data-target="100">100 Reps</button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="onboarding-actions-row mt-xl">
            <button type="button" class="btn btn--ghost" id="btn-skip-onboarding">
              Lewati &amp; Langsung Mulai
            </button>
            <button type="submit" class="btn-auth-primary" id="btn-save-onboarding">
              <span>Simpan Parameter &amp; Masuk Dashboard</span>
              <span class="btn-arrow" style="display:inline-flex; align-items:center;">${IconArrowRight(14, 'currentColor')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function initOnboardingPage(): void {
  const profile = getProfile();

  // Dynamic BMI Calculation on input changes
  const heightInput = document.getElementById('input-ob-height') as HTMLInputElement;
  const weightInput = document.getElementById('input-ob-weight') as HTMLInputElement;
  const bmiVal = document.getElementById('bmi-val');
  const bmiStatus = document.getElementById('bmi-status');

  const updateBMI = () => {
    const h = Number(heightInput?.value) || 170;
    const w = Number(weightInput?.value) || 65;
    const { bmi, status } = calculateBMI(h, w);
    if (bmiVal) bmiVal.textContent = String(bmi);
    if (bmiStatus) bmiStatus.textContent = status;
  };

  heightInput?.addEventListener('input', updateBMI);
  weightInput?.addEventListener('input', updateBMI);

  // Level Selection
  let selectedLevel = profile.fitnessLevel || 'intermediate';
  const levelCards = document.querySelectorAll('.level-card');
  levelCards.forEach(card => {
    card.addEventListener('click', () => {
      levelCards.forEach(c => c.classList.remove('level-card--active'));
      card.classList.add('level-card--active');
      selectedLevel = card.getAttribute('data-level') as any || 'intermediate';
      showToast(`Level dipilih: ${selectedLevel.toUpperCase()}`, 'info');
    });
  });

  // Focus Selection
  const focusChips = document.querySelectorAll('.focus-chip');
  focusChips.forEach(chip => {
    chip.addEventListener('click', () => {
      focusChips.forEach(c => c.classList.remove('focus-chip--active'));
      chip.classList.add('focus-chip--active');
      const name = chip.querySelector('.chip-name')?.textContent?.trim();
      showToast(`Fokus latihan: ${name}`, 'info');
    });
  });

  // Daily target selection
  let selectedTarget = profile.dailyRepTarget || 50;
  const targetChips = document.querySelectorAll('.target-rep-chip');
  targetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      targetChips.forEach(c => c.classList.remove('target-rep-chip--active'));
      chip.classList.add('target-rep-chip--active');
      selectedTarget = Number(chip.getAttribute('data-target')) || 50;
      showToast(`Target repetisi disetel: ${selectedTarget} reps/hari`, 'info');
    });
  });

  // Submit Handler
  const form = document.getElementById('form-onboarding');
  const handleSave = () => {
    const ageInput = document.getElementById('input-ob-age') as HTMLInputElement;

    profile.height = Number(heightInput?.value) || 170;
    profile.weight = Number(weightInput?.value) || 65;
    profile.age = Number(ageInput?.value) || 25;
    profile.fitnessLevel = selectedLevel;
    profile.dailyRepTarget = selectedTarget;
    profile.isLoggedIn = true;
    saveProfile(profile);

    showToast('Profil biometrik berhasil disimpan!', 'success');
    setTimeout(() => {
      router.navigate('/');
    }, 350);
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSave();
  });

  document.getElementById('btn-skip-onboarding')?.addEventListener('click', () => {
    showToast('Mengalihkan ke dashboard...', 'info');
    setTimeout(() => router.navigate('/'), 250);
  });
}
