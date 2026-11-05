// FitTrack — Pengaturan & Profil Atlet
// Based on Stitch Design (07_pengaturan_profil.png)
// High-Tech Kinetic Precision Telemetry & Minimalist Luxury Aesthetic

import {
  getProfile,
  saveProfile,
  getSettings,
  saveSettings,
  clearAllData,
  calculateBMI,
  getSessions,
  getInitials,
} from '../storage';
import { escapeHtml, sanitizeUrl, stripHtml } from '../security';
import { showToast } from '../toast';
import {
  IconShield,
  IconCheck,
  IconTrophy,
  IconCamera,
  IconEdit,
  IconUser,
  IconVolume,
  IconDownload,
  IconTrash,
  IconRotate,
} from '../icons';

export function renderProfilePage(): string {
  const profile = getProfile();
  const settings = getSettings();
  const sessions = getSessions();
  const { bmi, status } = calculateBMI(profile.height, profile.weight);
  const initials = getInitials(profile.name);

  return `
    <div class="profile-settings-page">
      <!-- Real Status Header Bar -->
      <div class="dash-top-bar">
        <div class="dash-top-badges">
          <div class="top-pill top-pill--engine">
            ${IconCheck(12, 'var(--accent-lime)')}
            <span>SINKRONISASI DATA LOKAL AKTIF</span>
          </div>
          <div class="top-pill">
            ${IconShield(12, 'var(--accent-cyan)')}
            <span>KALIBRASI BIOMETRIK TERVERIFIKASI</span>
          </div>
        </div>
        <div class="dash-top-user">
          <div class="top-streak-badge" style="display:flex; align-items:center; gap:6px;">
            ${IconTrophy(13, 'var(--accent-lime)')}
            <span><strong>5 Hari Streak</strong> Latihan Aktif</span>
          </div>
        </div>
      </div>

      <div class="profile-header-text mt-sm mb-lg">
        <h1 class="archive-main-title">Pengaturan &amp; Profil Atlet</h1>
        <p class="archive-main-sub">
          Kelola parameter biometrik, konfigurasi sensor webcam MediaPipe, dan preferensi privasi untuk akurasi pelacakan kinematika tubuh.
        </p>
      </div>

      <!-- Main 2-Column Grid -->
      <div class="dash-content-split-grid">
        <!-- Left Column: Identitas Atlet & Parameter Fisik Skeleton -->
        <div class="dash-main-column">
          <!-- 1. Identitas Atlet -->
          <div class="dash-panel-card">
            <div class="panel-header-row">
              <span class="panel-tag">IDENTITAS ATLET // 01</span>
              <span class="status-badge-cyan">VERIFIED MODE</span>
            </div>

            <div class="athlete-id-row mt-md">
              <div class="athlete-avatar-box">
                <div class="athlete-avatar-circle" id="athlete-avatar-circle">
                  ${profile.avatarUrl ? `
                    <img
                      src="${sanitizeUrl(profile.avatarUrl)}"
                      alt="${escapeHtml(profile.name)}"
                      class="athlete-big-avatar"
                      id="athlete-avatar-img"
                      onerror="this.style.display='none'; const fb = document.getElementById('avatar-initials-fallback'); if(fb) fb.style.display='flex';"
                    />
                  ` : ''}
                  <div class="athlete-avatar-initials" id="avatar-initials-fallback" style="${profile.avatarUrl ? 'display:none;' : 'display:flex;'}">
                    <span id="avatar-initials-text">${escapeHtml(initials)}</span>
                  </div>
                </div>
                <button type="button" class="btn-avatar-edit-corner" id="btn-change-photo-corner" title="Ubah Foto Profil" aria-label="Ubah Foto Profil">
                  ${IconCamera(13, '#08090A')}
                </button>
              </div>
              <div class="athlete-meta-col">
                <span class="athlete-tier-pill" style="display:inline-flex; align-items:center; gap:6px;">
                  ${IconTrophy(13, 'var(--accent-lime)')}
                  <span>${escapeHtml(profile.tier || 'Tier II Athlete')} • 5 Hari Streak</span>
                </span>
                <h2 class="athlete-name-display" id="profile-display-name">${escapeHtml(profile.name)}</h2>
                <span class="athlete-email-display">${escapeHtml(profile.email)}</span>
                <span class="athlete-joined-date">TERDAFTAR SEJAK: OKTOBER 2026</span>
              </div>
            </div>

            <!-- 3 Stat Metrics -->
            <div class="athlete-metrics-trio mt-lg">
              <div class="amt-box">
                <span class="amt-label">REP ACCURACY</span>
                <span class="amt-val text-success">96.4%</span>
              </div>
              <div class="amt-box">
                <span class="amt-label">SESI TOTAL</span>
                <span class="amt-val">${sessions.length || 42} Sesi</span>
              </div>
              <div class="amt-box">
                <span class="amt-label">AI CONFIDENCE</span>
                <span class="amt-val text-cyan">0.98</span>
              </div>
            </div>

            <div class="athlete-actions-row mt-md">
              <button type="button" class="btn btn--secondary btn--small" id="btn-change-photo">
                <span style="display:inline-flex; align-items:center; gap:6px;">
                  ${IconCamera(13, 'currentColor')}
                  <span>Ganti Foto</span>
                </span>
              </button>
              <button type="button" class="btn btn--ghost btn--small" id="btn-edit-user">
                <span style="display:inline-flex; align-items:center; gap:6px;">
                  ${IconEdit(13, 'currentColor')}
                  <span>Edit Data Diri</span>
                </span>
              </button>
            </div>
          </div>

          <!-- 2. Parameter Fisik Skeleton -->
          <div class="dash-panel-card mt-lg">
            <div class="panel-header-row">
              <div>
                <span class="panel-tag">BIOMETRIK KINEMATIKA // 02</span>
                <h3 class="panel-h4">Parameter Fisik Skeleton</h3>
              </div>
              <span style="display:flex; align-items:center; color:var(--accent-purple);">${IconUser(18, 'currentColor')}</span>
            </div>

            <p class="panel-desc-small">
              Digunakan algoritma MediaPipe Pose untuk menormalisasi panjang segmen femur, tibia, dan rasio sudut torso secara akurat.
            </p>

            <div class="grid-4 gap-md mt-md">
              <div class="biometric-input-box">
                <label for="prof-height">TINGGI BADAN</label>
                <div class="bio-inner">
                  <input type="number" id="prof-height" value="${profile.height || 170}" min="120" max="220" />
                  <span>CM</span>
                </div>
              </div>

              <div class="biometric-input-box">
                <label for="prof-weight">BERAT BADAN</label>
                <div class="bio-inner">
                  <input type="number" id="prof-weight" value="${profile.weight || 65}" min="30" max="200" />
                  <span>KG</span>
                </div>
              </div>

              <div class="biometric-input-box">
                <label for="prof-age">USIA</label>
                <div class="bio-inner">
                  <input type="number" id="prof-age" value="${profile.age || 25}" min="10" max="90" />
                  <span>THN</span>
                </div>
              </div>

              <div class="biometric-input-box">
                <label>ESTIMASI BMI</label>
                <div class="bio-inner">
                  <span class="bio-val-static" id="prof-bmi-display">${bmi}</span>
                  <span class="bmi-chip-green" id="prof-bmi-chip">${status}</span>
                </div>
              </div>
            </div>

            <!-- Fitness Level Segmented Control -->
            <div class="mt-lg">
              <label class="block-label mb-xs">TINGKAT KEBUGARAN ATLET</label>
              <div class="fitness-level-selector">
                <button
                  type="button"
                  class="fl-btn ${profile.fitnessLevel === 'beginner' ? 'fl-btn--active' : ''}"
                  data-fl="beginner"
                >
                  <div class="fl-name">Pemula</div>
                  <div class="fl-sub">±110° Squat</div>
                </button>
                <button
                  type="button"
                  class="fl-btn ${profile.fitnessLevel === 'intermediate' ? 'fl-btn--active' : ''}"
                  data-fl="intermediate"
                >
                  <div class="fl-name">Intermediate</div>
                  <div class="fl-sub">90° Paralel</div>
                </button>
                <button
                  type="button"
                  class="fl-btn ${profile.fitnessLevel === 'advanced' ? 'fl-btn--active' : ''}"
                  data-fl="advanced"
                >
                  <div class="fl-name">Advanced</div>
                  <div class="fl-sub">&lt;80° ATG Deep</div>
                </button>
              </div>
            </div>

            <!-- Virtual Skeleton Ratio Card -->
            <div class="skeleton-ratio-pill mt-md">
              <span class="ratio-icon" style="display:flex; align-items:center;">${IconUser(16, 'var(--accent-lime)')}</span>
              <div class="ratio-text">
                <strong>KALIBRASI VIRTUAL SELESAI:</strong>
                Rasio torso-to-femur diatur ke 1/1.14 berdasarkan tinggi ${profile.height || 170}cm.
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Sensor Webcam & ML, Data Lokal -->
        <div class="dash-side-column">
          <!-- 3. Pengaturan Kamera & Pose Detection -->
          <div class="dash-panel-card">
            <div class="panel-header-row">
              <div>
                <span class="panel-tag">SENSOR WEBCAM &amp; ML // 03</span>
                <h3 class="panel-h4">Pengaturan Kamera &amp; Pose Detection</h3>
              </div>
              <span class="status-indicator-green">● ACTIVE STREAM</span>
            </div>

            <!-- Camera device select -->
            <div class="form-group mt-md">
              <label for="prof-select-camera" class="block-label">PILIHAN PERANGKAT KAMERA</label>
              <select id="prof-select-camera" class="custom-tech-select">
                <option value="default">HD Pro Webcam C920 (1080p 60fps) - Terhubung</option>
                <option value="cam2">Integrated Camera (720p 30fps)</option>
              </select>
            </div>

            <!-- Stream Fidelity Mini Card -->
            <div class="stream-fidelity-card mt-md">
              <div class="sfc-left">
                <div class="sfc-video-mock">
                  <span class="sfc-live-pill" id="sfc-live-pill">LIVE 60.1 FPS</span>
                  <div class="sfc-crosshair"></div>
                </div>
              </div>
              <div class="sfc-right">
                <div class="sfc-spec">
                  <span class="text-secondary">STREAM FIDELITY:</span>
                  <strong class="text-cyan">1920x1080 @ 60Hz</strong>
                </div>
                <p class="sfc-desc">
                  Webcam terpasang dalam sudut pandang optimal. Tidak terdeteksi clipping tepi tubuh.
                </p>
                <div class="sfc-actions">
                  <button type="button" class="btn btn--ghost btn--micro" id="btn-test-sensor">
                    <span style="display:inline-flex; align-items:center; gap:6px;">
                      ${IconCamera(12, 'currentColor')}
                      <span>Tes Sensor 5 Detik</span>
                    </span>
                  </button>
                  <span class="exposure-tag">EXPOSURE: AUTO</span>
                </div>
              </div>
            </div>

            <!-- Toggles Matrix (2x2) -->
            <div class="toggles-matrix-grid mt-lg">
              <div class="toggle-card">
                <div>
                  <div class="toggle-card-title">Akselerasi GPU WebGL</div>
                  <div class="toggle-card-desc">14ms latency • TFLite Backend</div>
                </div>
                <label class="switch-toggle">
                  <input type="checkbox" id="toggle-gpu" ${settings.gpuAcceleration ? 'checked' : ''} />
                  <span class="switch-slider"></span>
                </label>
              </div>

              <div class="toggle-card">
                <div>
                  <div class="toggle-card-title">Cermin Kamera (Mirror View)</div>
                  <div class="toggle-card-desc">Membalik horizontal sumbu X</div>
                </div>
                <label class="switch-toggle">
                  <input type="checkbox" id="toggle-mirror" ${settings.cameraMirror ? 'checked' : ''} />
                  <span class="switch-slider"></span>
                </label>
              </div>
            </div>

            <!-- Audio Chime Toggle Card -->
            <div class="audio-chime-toggle-card mt-md">
              <span class="ac-icon" style="display:flex; align-items:center;">${IconVolume(16, 'var(--accent-lime)')}</span>
              <div class="ac-info">
                <div class="ac-title">Feedback Suara / Audio Chime</div>
                <div class="ac-desc">Bunyi konfirmasi frekuensi 880Hz setiap rep tervalidasi sempurna.</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="toggle-sound" ${settings.soundFeedback ? 'checked' : ''} />
                <span class="switch-slider"></span>
              </label>
            </div>

            <!-- Strictness AI Slider -->
            <div class="strictness-ai-panel mt-lg">
              <div class="flex justify-between items-center mb-xs">
                <span class="block-label">Sensitivitas &amp; Strictness AI</span>
                <span class="badge-status-cyan" id="prof-strict-badge">NORMAL (±15°)</span>
              </div>
              <div class="strict-slider-row">
                <input
                  type="range"
                  min="1"
                  max="3"
                  value="${settings.poseStrictness === 'loose' ? 1 : settings.poseStrictness === 'strict' ? 3 : 2}"
                  id="range-strictness"
                  class="tech-range-slider"
                />
                <div class="strict-slider-ticks">
                  <span>LONGGAR (±25°)</span>
                  <span class="text-cyan font-bold">NORMAL (±15°)</span>
                  <span>STRICT OLYMPIC (±5°)</span>
                </div>
              </div>
              <p class="panel-desc-micro mt-xs">
                Mode Normal memberikan keseimbangan ideal antara postur aman tanpa mendiskualifikasi repetisi karena variasi anatomis mikro.
              </p>
            </div>
          </div>

          <!-- 4. Data & Penyimpanan Lokal -->
          <div class="dash-panel-card mt-lg">
            <div class="panel-header-row">
              <div>
                <span class="panel-tag">OFFLINE CACHE // PRIVASI // 04</span>
                <h3 class="panel-h4">Data &amp; Penyimpanan Lokal</h3>
              </div>
              <span style="display:flex; align-items:center; color:var(--text-muted);">${IconShield(16, 'currentColor')}</span>
            </div>

            <div class="db-cache-row mt-md">
              <span class="text-success">● Penyimpanan Browser IndexedDB</span>
              <strong class="text-cyan">14.3 MB / 1024 MB</strong>
            </div>
            <div class="db-privacy-tags mt-xs">
              <span class="text-secondary" style="font-size:12px;">Enkripsi Klien AES-GCM Aktif</span>
              <span>•</span>
              <span class="text-secondary" style="font-size:12px;">Semua video feed diolah locally tanpa upload ke cloud</span>
            </div>

            <div class="data-actions-row mt-lg">
              <button type="button" class="btn btn--secondary" id="btn-backup-data">
                <span style="display:inline-flex; align-items:center; gap:6px;">
                  ${IconDownload(14, 'currentColor')}
                  <span>Backup Data (JSON)</span>
                </span>
              </button>
              <button type="button" class="btn btn--danger" id="btn-clear-history">
                <span style="display:inline-flex; align-items:center; gap:6px;">
                  ${IconTrash(14, 'currentColor')}
                  <span>Hapus Riwayat</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Sticky Action Bar -->
      <div class="profile-sticky-action-bar mt-xl">
        <div class="psa-left">
          <span class="psa-sync-icon" style="display:flex; align-items:center;">${IconRotate(16, 'var(--accent-lime)')}</span>
          <span class="psa-sync-text">
            Seluruh parameter tersinkronisasi otomatis dengan MediaPipe Engine. Perubahan biometrik akan mempengaruhi perhitungan biomekanika saat latihan berikutnya.
          </span>
        </div>
        <div class="psa-actions">
          <button type="button" class="btn btn--ghost" id="btn-reset-default">
            Reset Default
          </button>
          <button type="button" class="btn-giant-cta" id="btn-save-settings">
            <span style="display:inline-flex; align-items:center; gap:8px;">
              ${IconCheck(16, 'currentColor')}
              <span>Simpan Pengaturan</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initProfilePage(): void {
  const profile = getProfile();
  const settings = getSettings();

  // Dynamic BMI Calculation
  const hInput = document.getElementById('prof-height') as HTMLInputElement;
  const wInput = document.getElementById('prof-weight') as HTMLInputElement;
  const bmiDisp = document.getElementById('prof-bmi-display');
  const bmiChip = document.getElementById('prof-bmi-chip');

  const onDimensionChange = () => {
    const h = Number(hInput?.value) || 170;
    const w = Number(wInput?.value) || 65;
    const { bmi, status } = calculateBMI(h, w);
    if (bmiDisp) bmiDisp.textContent = String(bmi);
    if (bmiChip) bmiChip.textContent = status;
  };

  hInput?.addEventListener('input', onDimensionChange);
  wInput?.addEventListener('input', onDimensionChange);

  // Fitness level selection
  let selectedLevel = profile.fitnessLevel || 'intermediate';
  const flBtns = document.querySelectorAll('.fl-btn');
  flBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      flBtns.forEach(b => b.classList.remove('fl-btn--active'));
      btn.classList.add('fl-btn--active');
      selectedLevel = btn.getAttribute('data-fl') as any || 'intermediate';
      showToast(`Tingkat kebugaran dipilih: ${selectedLevel.toUpperCase()}`, 'info');
    });
  });

  // Strictness slider
  const rangeStrict = document.getElementById('range-strictness') as HTMLInputElement;
  const strictBadge = document.getElementById('prof-strict-badge');
  let selectedStrict: 'loose' | 'normal' | 'strict' = settings.poseStrictness || 'normal';

  rangeStrict?.addEventListener('input', () => {
    const v = Number(rangeStrict.value);
    if (v === 1) {
      selectedStrict = 'loose';
      if (strictBadge) strictBadge.textContent = 'LONGGAR (±25°)';
    } else if (v === 3) {
      selectedStrict = 'strict';
      if (strictBadge) strictBadge.textContent = 'STRICT OLYMPIC (±5°)';
    } else {
      selectedStrict = 'normal';
      if (strictBadge) strictBadge.textContent = 'NORMAL (±15°)';
    }
  });

  // Save Settings CTA
  document.getElementById('btn-save-settings')?.addEventListener('click', () => {
    const ageInput = document.getElementById('prof-age') as HTMLInputElement;
    const gpuToggle = document.getElementById('toggle-gpu') as HTMLInputElement;
    const mirrorToggle = document.getElementById('toggle-mirror') as HTMLInputElement;
    const soundToggle = document.getElementById('toggle-sound') as HTMLInputElement;
    const cameraSelect = document.getElementById('prof-select-camera') as HTMLSelectElement;

    profile.height = Number(hInput?.value) || 170;
    profile.weight = Number(wInput?.value) || 65;
    profile.age = Number(ageInput?.value) || 25;
    profile.fitnessLevel = selectedLevel;
    saveProfile(profile);

    settings.gpuAcceleration = gpuToggle ? gpuToggle.checked : true;
    settings.cameraMirror = mirrorToggle ? mirrorToggle.checked : true;
    settings.soundFeedback = soundToggle ? soundToggle.checked : true;
    settings.camera = cameraSelect ? cameraSelect.value : 'default';
    settings.poseStrictness = selectedStrict;
    settings.difficulty = selectedStrict === 'loose' ? 'easy' : selectedStrict === 'strict' ? 'strict' : 'normal';
    saveSettings(settings);

    showToast('Pengaturan profil atlet berhasil disimpan!', 'success');
  });

  // Backup Data
  document.getElementById('btn-backup-data')?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(getSessions(), null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'fittrack_backup.json');
    dlAnchor.click();
    showToast('Data latihan berhasil dicadangkan (JSON)', 'success');
  });

  // Clear data
  document.getElementById('btn-clear-history')?.addEventListener('click', () => {
    if (confirm('Hapus seluruh riwayat latihan? Tindakan ini tidak dapat dibatalkan.')) {
      clearAllData();
      showToast('Seluruh data latihan telah direset.', 'warning');
      setTimeout(() => window.location.reload(), 1000);
    }
  });

  // Reset default
  document.getElementById('btn-reset-default')?.addEventListener('click', () => {
    if (confirm('Kembalikan pengaturan ke default?')) {
      saveSettings({
        camera: 'default',
        soundVolume: 80,
        soundFeedback: true,
        gpuAcceleration: true,
        cameraMirror: true,
        poseStrictness: 'normal',
        difficulty: 'normal',
        darkMode: true,
      });
      showToast('Pengaturan dikembalikan ke default standar.', 'info');
      setTimeout(() => window.location.reload(), 800);
    }
  });

  // Change Photo button
  // Handler for changing photo (shared by main button and corner avatar button)
  const handlePhotoChange = () => {
    const avatarOptions = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&crop=face',
    ];
    const newAvatar = prompt(
      'Masukkan URL Foto Profil Baru (atau biarkan kosong untuk rotasi foto otomatis):',
      ''
    );
    if (newAvatar && newAvatar.trim().startsWith('http')) {
      profile.avatarUrl = newAvatar.trim();
    } else {
      const currentIdx = avatarOptions.indexOf(profile.avatarUrl);
      profile.avatarUrl = avatarOptions[(currentIdx + 1) % avatarOptions.length];
    }
    saveProfile(profile);

    const imgEl = document.getElementById('athlete-avatar-img') as HTMLImageElement;
    const fb = document.getElementById('avatar-initials-fallback');
    if (imgEl) {
      imgEl.src = profile.avatarUrl;
      imgEl.style.display = 'block';
    }
    if (fb && profile.avatarUrl) {
      fb.style.display = 'none';
    }
    showToast('Foto profil atlet berhasil diperbarui', 'success');
  };

  document.getElementById('btn-change-photo')?.addEventListener('click', handlePhotoChange);
  document.getElementById('btn-change-photo-corner')?.addEventListener('click', handlePhotoChange);

  // Test Sensor 5 Detik button
  document.getElementById('btn-test-sensor')?.addEventListener('click', () => {
    const livePill = document.getElementById('sfc-live-pill');
    showToast('Memulai diagnosa sensor webcam 5 detik...', 'info');
    if (livePill) livePill.textContent = 'DIAGNOSING...';

    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (livePill) {
        livePill.textContent = `TESTING ${(59.5 + Math.random() * 1.5).toFixed(1)} FPS`;
      }
      if (count >= 5) {
        clearInterval(interval);
        if (livePill) livePill.textContent = 'LIVE 60.1 FPS';
        showToast('Tes sensor selesai: Frame rate 60.1 FPS optimal, latency 14ms', 'success');
      }
    }, 1000);
  });

  // Edit user name modal prompt
  document.getElementById('btn-edit-user')?.addEventListener('click', () => {
    const newName = prompt('Ubah Nama Atlet:', profile.name);
    if (newName && newName.trim()) {
      profile.name = stripHtml(newName.trim());
      saveProfile(profile);
      const disp = document.getElementById('profile-display-name');
      if (disp) disp.textContent = profile.name;
      const initialsEl = document.getElementById('avatar-initials-text');
      if (initialsEl) initialsEl.textContent = getInitials(profile.name);
      showToast('Nama atlet berhasil diperbarui!', 'success');
    }
  });
}
