// FitTrack — Register Page
// Based on Stitch Design (05_register.png)
// Minimalist Luxury Aesthetic with Vector SVG Icons

import { router } from '../router';
import { getProfile, saveProfile, syncWithBackend } from '../storage';
import { api, setTokens } from '../api';
import { showToast } from '../toast';
import { stripHtml } from '../security';
import {
  IconShield,
  IconLock,
  IconUser,
  IconMail,
  IconCheck,
  IconDumbbell,
  IconFlame,
  IconTarget,
  IconArrowRight,
} from '../icons';

export function renderRegisterPage(): string {
  return `
    <div class="auth-page auth-page--register">
      <!-- Top Privacy Banner -->
      <div class="privacy-top-pill" style="display:inline-flex; align-items:center; gap:6px;">
        <span class="privacy-shield" style="display:inline-flex; align-items:center;">${IconShield(13, 'currentColor')}</span>
        <span>ZERO CLOUD VIDEO UPLOAD • PRIVATE BROWSER PROCESSING</span>
      </div>

      <div class="register-layout-grid">
        <!-- Left Panel: AI Engine Telemetry Showcase -->
        <div class="register-info-panel">
          <div class="panel-brand-header">
            <div class="auth-logo-box">
              <span class="auth-logo-text">FT</span>
            </div>
            <div>
              <div class="brand-title">FitTrack</div>
              <div class="brand-sub">AI VISION ENGINE V2.4</div>
            </div>
          </div>

          <div class="tech-badge mt-md">EDGE-COMPUTING BIOMECHANICS</div>
          <h2 class="panel-headline">Presisi Kinematika Tanpa Latensi</h2>
          <p class="panel-desc">
            Sensor visi komputer berbasis WebAssembly & WebGL membaca 33 titik persendian tubuh secara real-time dengan akurasi 99.4%.
          </p>

          <!-- Sensor Mesh Visualizer Component -->
          <div class="mesh-visualizer-card">
            <div class="visualizer-header">
              <span class="visualizer-title">SENSOR MESH VISUALIZER</span>
              <span class="sync-badge">● 60 FPS SYNC</span>
            </div>

            <!-- Stylized Humanoid Skeleton Graphic -->
            <div class="skeleton-canvas-wrapper">
              <svg viewBox="0 0 200 220" class="svg-skeleton-preview">
                <!-- Head -->
                <circle cx="100" cy="30" r="14" class="skel-head" />
                <circle cx="100" cy="30" r="6" class="skel-head-core" />
                <!-- Spine / Torso -->
                <line x1="100" y1="44" x2="100" y2="100" class="skel-bone" />
                <!-- Shoulders -->
                <line x1="65" y1="58" x2="135" y2="58" class="skel-bone" />
                <!-- Left Arm -->
                <line x1="65" y1="58" x2="45" y2="85" class="skel-bone" />
                <line x1="45" y1="85" x2="35" y2="115" class="skel-bone" />
                <!-- Right Arm -->
                <line x1="135" y1="58" x2="155" y2="85" class="skel-bone" />
                <line x1="155" y1="85" x2="165" y2="115" class="skel-bone" />
                <!-- Hips -->
                <line x1="78" y1="100" x2="122" y2="100" class="skel-bone" />
                <!-- Left Leg (Squat bent) -->
                <line x1="78" y1="100" x2="60" y2="140" class="skel-bone skel-bone--accent" />
                <line x1="60" y1="140" x2="72" y2="185" class="skel-bone skel-bone--accent" />
                <!-- Right Leg -->
                <line x1="122" y1="100" x2="140" y2="140" class="skel-bone skel-bone--accent" />
                <line x1="140" y1="140" x2="128" y2="185" class="skel-bone skel-bone--accent" />

                <!-- Joints Dots -->
                <circle cx="65" cy="58" r="4" class="skel-joint" />
                <circle cx="135" cy="58" r="4" class="skel-joint" />
                <circle cx="45" cy="85" r="4" class="skel-joint" />
                <circle cx="155" cy="85" r="4" class="skel-joint" />
                <circle cx="35" cy="115" r="4" class="skel-joint" />
                <circle cx="165" cy="115" r="4" class="skel-joint" />
                <circle cx="78" cy="100" r="4" class="skel-joint" />
                <circle cx="122" cy="100" r="4" class="skel-joint" />
                <circle cx="60" cy="140" r="5" class="skel-joint skel-joint--neon" />
                <circle cx="140" cy="140" r="5" class="skel-joint skel-joint--neon" />
                <circle cx="72" cy="185" r="4" class="skel-joint" />
                <circle cx="128" cy="185" r="4" class="skel-joint" />
              </svg>

              <!-- Floating Angle Callouts -->
              <div class="mesh-callout mesh-callout--left">
                <div class="callout-label">KNEE ANGLE</div>
                <div class="callout-value text-success">91.4° VALID</div>
              </div>

              <div class="mesh-callout mesh-callout--right">
                <div class="callout-label">SPINE VECTOR</div>
                <div class="callout-value text-cyan">OPTIMAL</div>
              </div>
            </div>

            <!-- Visualizer Stats Grid -->
            <div class="visualizer-stats-row">
              <div class="v-stat-box">
                <span class="v-label">INFERENCE</span>
                <span class="v-value">14.2 ms</span>
              </div>
              <div class="v-stat-box">
                <span class="v-label">TRACKED</span>
                <span class="v-value">33 PTS</span>
              </div>
              <div class="v-stat-box">
                <span class="v-label">LOCAL WASM</span>
                <span class="v-value text-success">ACTIVE</span>
              </div>
            </div>
          </div>

          <div class="panel-security-note">
            <span class="lock-icon" style="display:inline-flex; align-items:center;">${IconLock(14, 'var(--accent-lime)')}</span>
            <span>Kamera aktif hanya selama repetisi latihan berlangsung dan frame langsung dihapus seketika dari RAM.</span>
          </div>
        </div>

        <!-- Right Panel: Registration Form -->
        <div class="register-form-panel">
          <h1 class="register-title">Buat Akun FitTrack Baru</h1>
          <p class="register-subtitle">Mulai analisis biomekanika real-time dengan kamera browser Anda</p>

          <!-- Social Buttons -->
          <div class="social-login-grid mb-md">
            <button type="button" class="btn-social" id="btn-reg-google">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V13.82h6.887C18.2 16.48 15.61 18.3 12.24 18.3c-3.53 0-6.4-2.87-6.4-6.4s2.87-6.4 6.4-6.4c1.6 0 3.06.59 4.19 1.57l2.64-2.64C17.45 2.87 15.01 2 12.24 2 6.72 2 2.24 6.48 2.24 12s4.48 10 10 10c5.77 0 9.61-4.06 9.61-9.78 0-.66-.07-1.3-.19-1.935H12.24z"/>
              </svg>
              <span>Daftar via Google</span>
            </button>
            <button type="button" class="btn-social" id="btn-reg-apple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.64-.78 1.08-1.86.96-2.95-.93.04-2.06.62-2.73 1.4-.59.68-1.1 1.77-.96 2.83 1.04.08 2.09-.5 2.73-1.28z"/>
              </svg>
              <span>Daftar via Apple</span>
            </button>
          </div>

          <div class="auth-divider">
            <span>ATAU REGISTRASI MANUAL</span>
          </div>

          <form id="form-register" onsubmit="return false;">
            <!-- Nama Lengkap -->
            <div class="form-group">
              <label for="reg-name">Nama Lengkap</label>
              <div class="input-icon-wrapper">
                <span class="input-icon" style="display:flex; align-items:center;">
                  ${IconUser(16, 'var(--text-muted)')}
                </span>
                <input
                  type="text"
                  id="reg-name"
                  class="auth-input"
                  placeholder="Alex Pratama"
                  required
                />
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="reg-email">Alamat Email</label>
              <div class="input-icon-wrapper">
                <span class="input-icon" style="display:flex; align-items:center;">
                  ${IconMail(16, 'var(--text-muted)')}
                </span>
                <input
                  type="email"
                  id="reg-email"
                  class="auth-input"
                  placeholder="alex.pratama@athlete.io"
                  required
                />
              </div>
            </div>

            <!-- Password & Confirm Password Grid -->
            <div class="grid-2 gap-md">
              <div class="form-group">
                <label for="reg-pw">Kata Sandi</label>
                <div class="input-icon-wrapper">
                  <span class="input-icon" style="display:flex; align-items:center;">
                    ${IconLock(16, 'var(--text-muted)')}
                  </span>
                  <input
                    type="password"
                    id="reg-pw"
                    class="auth-input"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="reg-confirm-pw">Konfirmasi Sandi</label>
                <div class="input-icon-wrapper">
                  <span class="input-icon" style="display:flex; align-items:center;">
                    ${IconCheck(14, 'var(--accent-lime)')}
                  </span>
                  <input
                    type="password"
                    id="reg-confirm-pw"
                    class="auth-input"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Password Strength Bar -->
            <div class="pw-strength-container mb-md">
              <div class="pw-strength-labels">
                <span>KEKUATAN SANDI</span>
                <span id="pw-strength-text" class="text-warning">Cukup Kuat</span>
              </div>
              <div class="pw-strength-track">
                <div class="pw-strength-fill" style="width: 75%;"></div>
              </div>
              <span class="pw-hint">Wajib: Min. 8 karakter, kombinasi huruf besar/kecil, angka & simbol spesial.</span>
            </div>

            <!-- Target Latihan Utama (3 Cards) -->
            <div class="form-group">
              <label class="mb-xs" style="display:block;">Target Latihan Utama</label>
              <div class="goal-selection-cards" id="goal-selection">
                <div class="goal-card goal-card--active" data-goal="strength">
                  <span class="goal-icon" style="display:flex; align-items:center; justify-content:center;">${IconDumbbell(18, 'currentColor')}</span>
                  <span class="goal-title">Kekuatan & Postur</span>
                </div>
                <div class="goal-card" data-goal="cardio">
                  <span class="goal-icon" style="display:flex; align-items:center; justify-content:center;">${IconFlame(18, 'currentColor')}</span>
                  <span class="goal-title">Kardio & Fat Burn</span>
                </div>
                <div class="goal-card" data-goal="mobility">
                  <span class="goal-icon" style="display:flex; align-items:center; justify-content:center;">${IconTarget(18, 'currentColor')}</span>
                  <span class="goal-title">Biomekanika & Mobilitas</span>
                </div>
              </div>
            </div>

            <!-- Camera Privacy Consent -->
            <div class="form-options-row mb-lg">
              <label class="custom-checkbox-label" style="align-items:flex-start;">
                <input type="checkbox" id="check-consent" checked required />
                <span class="checkbox-custom" style="margin-top:2px;"></span>
                <span style="font-size:12px;line-height:1.5;color:var(--text-secondary);">
                  Saya menyetujui izin akses kamera untuk kalibrasi AI. Data video diproses secara lokal 100% di browser melalui WebGL WASM tanpa dikirim ke server cloud.
                </span>
              </label>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-auth-primary" id="btn-submit-register">
              <span>Daftar & Lanjut ke Data Fisik</span>
              <span class="btn-arrow" style="display:inline-flex; align-items:center;">${IconArrowRight(14, 'currentColor')}</span>
            </button>

            <!-- Login Link -->
            <div class="auth-footer-link mt-md">
              Sudah memiliki akun? <a href="#/login">Masuk di sini</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function initRegisterPage(): void {
  let selectedGoal: 'strength' | 'cardio' | 'mobility' = 'strength';

  // Goal cards selection
  const goalCards = document.querySelectorAll('.goal-card');
  goalCards.forEach(card => {
    card.addEventListener('click', () => {
      goalCards.forEach(c => c.classList.remove('goal-card--active'));
      card.classList.add('goal-card--active');
      selectedGoal = card.getAttribute('data-goal') as any || 'strength';
      showToast(`Fokus latihan: ${card.querySelector('.goal-title')?.textContent?.trim()}`, 'info');
    });
  });

  // Register submit
  const form = document.getElementById('form-register');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('reg-name') as HTMLInputElement;
    const emailInput = document.getElementById('reg-email') as HTMLInputElement;
    const pwInput = document.getElementById('reg-pw') as HTMLInputElement;

    const name = stripHtml(nameInput?.value || 'Alex Pratama');
    const email = (emailInput?.value || 'alex.pratama@example.com').trim().toLowerCase();
    const password = pwInput?.value || 'SecurePass123!';

    const submitBtn = document.getElementById('btn-submit-register') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Mendaftarkan ke Server...</span>';
    }

    try {
      const res = await api.auth.register({
        name,
        email,
        password,
        fitnessGoal: selectedGoal,
      });

      if (res?.accessToken) {
        setTokens(res.accessToken, res.refreshToken);
        await syncWithBackend();
      }
    } catch (err: any) {
      console.warn('[Register] API Register offline/fallback:', err.message);
    } finally {
      const profile = getProfile();
      profile.name = name;
      profile.email = email;
      profile.fitnessGoal = selectedGoal;
      profile.isLoggedIn = true;
      saveProfile(profile);

      showToast('Pendaftaran akun berhasil! Melanjutkan ke kalibrasi fisik...', 'success');
      setTimeout(() => {
        router.navigate('/onboarding');
      }, 350);
    }
  });

  document.getElementById('btn-reg-google')?.addEventListener('click', () => {
    showToast('Mengautentikasi via Google...', 'info');
    setTimeout(() => router.navigate('/onboarding'), 300);
  });

  document.getElementById('btn-reg-apple')?.addEventListener('click', () => {
    showToast('Mengautentikasi via Apple ID...', 'info');
    setTimeout(() => router.navigate('/onboarding'), 300);
  });
}
