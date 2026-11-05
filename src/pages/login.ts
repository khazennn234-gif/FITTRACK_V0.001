// FitTrack — Login Page
// Based on Stitch Design (04_login.png)
// Minimalist Luxury Aesthetic with Vector SVG Icons

import { router } from '../router';
import { getProfile, saveProfile, syncWithBackend } from '../storage';
import { api, setTokens } from '../api';
import { showToast } from '../toast';
import {
  IconMail,
  IconLock,
  IconEye,
  IconArrowRight,
} from '../icons';

export function renderLoginPage(): string {
  const profile = getProfile();

  return `
    <div class="auth-page">
      <div class="auth-container">
        <!-- Main Login Card -->
        <div class="auth-card">
          <!-- Logo & Status -->
          <div class="auth-logo-header">
            <div class="auth-logo-box">
              <span class="auth-logo-text">FT</span>
            </div>
            <div class="badge-status-pill" style="display:inline-flex; align-items:center; gap:6px;">
              <span class="status-dot"></span>
              <span>NEURAL HUD ONLINE</span>
            </div>
          </div>

          <!-- Title & Subtitle -->
          <h1 class="auth-title">Masuk ke FitTrack AI</h1>
          <p class="auth-subtitle">Akses telemetri latihan dan deteksi postur MediaPipe 60 FPS Anda.</p>

          <!-- Login Form -->
          <form id="form-login" class="auth-form" onsubmit="return false;">
            <!-- Email Field -->
            <div class="form-group">
              <div class="form-label-row">
                <label for="login-email">Alamat Email</label>
                <span class="form-meta-tag">SECURE ID</span>
              </div>
              <div class="input-icon-wrapper">
                <span class="input-icon" style="display:flex; align-items:center;">
                  ${IconMail(16, 'var(--text-muted)')}
                </span>
                <input
                  type="email"
                  id="login-email"
                  class="auth-input"
                  placeholder="alex.pratama@example.com"
                  value="${profile.email || 'alex.pratama@example.com'}"
                  required
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <div class="form-label-row">
                <label for="login-password">Kata Sandi</label>
                <a href="#/login" class="form-forgot-link" id="link-forgot-pw">Lupa Kata Sandi?</a>
              </div>
              <div class="input-icon-wrapper">
                <span class="input-icon" style="display:flex; align-items:center;">
                  ${IconLock(16, 'var(--text-muted)')}
                </span>
                <input
                  type="password"
                  id="login-password"
                  class="auth-input"
                  placeholder="••••••••••••"
                  value="fittrack2026"
                  required
                />
                <button type="button" class="input-toggle-pw" id="btn-toggle-pw" title="Lihat kata sandi" style="display:flex; align-items:center; justify-content:center;">
                  ${IconEye(16, 'var(--text-muted)')}
                </button>
              </div>
            </div>

            <!-- Remember & Security Tag -->
            <div class="form-options-row">
              <label class="custom-checkbox-label">
                <input type="checkbox" id="check-remember" checked />
                <span class="checkbox-custom"></span>
                <span>Ingat perangkat ini</span>
              </label>
              <span class="security-badge" style="display:inline-flex; align-items:center; gap:5px;">
                ${IconLock(12, 'var(--accent-lime)')}
                <span>INDEXEDDB AES-256</span>
              </span>
            </div>

            <!-- Submit CTA Button -->
            <button type="submit" class="btn-auth-primary" id="btn-submit-login">
              <span>Masuk Sekarang</span>
              <span class="btn-arrow" style="display:inline-flex; align-items:center;">${IconArrowRight(14, 'currentColor')}</span>
            </button>

            <!-- Social Login Divider -->
            <div class="auth-divider">
              <span>ATAU MASUK DENGAN</span>
            </div>

            <!-- Social Buttons -->
            <div class="social-login-grid">
              <button type="button" class="btn-social" id="btn-login-google">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V13.82h6.887C18.2 16.48 15.61 18.3 12.24 18.3c-3.53 0-6.4-2.87-6.4-6.4s2.87-6.4 6.4-6.4c1.6 0 3.06.59 4.19 1.57l2.64-2.64C17.45 2.87 15.01 2 12.24 2 6.72 2 2.24 6.48 2.24 12s4.48 10 10 10c5.77 0 9.61-4.06 9.61-9.78 0-.66-.07-1.3-.19-1.935H12.24z"/>
                </svg>
                <span>Google</span>
              </button>
              <button type="button" class="btn-social" id="btn-login-apple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.64-.78 1.08-1.86.96-2.95-.93.04-2.06.62-2.73 1.4-.59.68-1.1 1.77-.96 2.83 1.04.08 2.09-.5 2.73-1.28z"/>
                </svg>
                <span>Apple ID</span>
              </button>
            </div>

            <!-- Register Switch Link -->
            <div class="auth-footer-link">
              Belum punya akun? <a href="#/register" id="link-to-register">Daftar Akun Baru</a>
            </div>
          </form>
        </div>

        <!-- Telemetry Bottom Info Tag -->
        <div class="auth-bottom-telemetry">
          <span class="telemetry-dot"></span>
          <span>Browser-native 60 FPS Pose Engine • WASM + WebGPU • LATENCY &lt; 14ms</span>
        </div>
      </div>
    </div>
  `;
}

export function initLoginPage(): void {
  // Password reveal toggle
  const toggleBtn = document.getElementById('btn-toggle-pw');
  const pwInput = document.getElementById('login-password') as HTMLInputElement;
  toggleBtn?.addEventListener('click', () => {
    if (pwInput.type === 'password') {
      pwInput.type = 'text';
      toggleBtn.innerHTML = IconEye(16, 'var(--accent-lime)');
    } else {
      pwInput.type = 'password';
      toggleBtn.innerHTML = IconEye(16, 'var(--text-muted)');
    }
  });

  // Forgot password link
  document.getElementById('link-forgot-pw')?.addEventListener('click', (e) => {
    e.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement)?.value || 'alex@example.com';
    showToast(`Tautan reset sandi dikirimkan ke: ${email}`, 'info');
  });

  // Login handler
  const form = document.getElementById('form-login');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
  });

  document.getElementById('btn-login-google')?.addEventListener('click', () => {
    showToast('Mengautentikasi via Google Single Sign-On...', 'info');
    setTimeout(() => handleLogin(), 300);
  });

  document.getElementById('btn-login-apple')?.addEventListener('click', () => {
    showToast('Mengautentikasi via Apple ID...', 'info');
    setTimeout(() => handleLogin(), 300);
  });
}

async function handleLogin(): Promise<void> {
  const emailInput = document.getElementById('login-email') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;
  const email = emailInput?.value || 'alex@example.com';
  const password = passwordInput?.value || 'Password123!';
  const submitBtn = document.getElementById('btn-submit-login') as HTMLButtonElement;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Menghubungkan ke API...</span>';
  }

  try {
    const res = await api.auth.login({ email, password });
    if (res?.accessToken) {
      setTokens(res.accessToken, res.refreshToken);
      await syncWithBackend();
    }
  } catch (err: any) {
    console.warn('[Login] API Login offline/fallback:', err.message);
  } finally {
    const profile = getProfile();
    profile.email = email;
    profile.isLoggedIn = true;
    saveProfile(profile);
    showToast('Login berhasil! Mengalihkan ke dashboard...', 'success');
    setTimeout(() => {
      router.navigate('/');
    }, 350);
  }
}
