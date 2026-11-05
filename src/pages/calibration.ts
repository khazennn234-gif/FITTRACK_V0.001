// FitTrack — Camera Calibration & Sensor Alignment Page
// High-Tech Cyber HUD Calibration Interface

import { router } from '../router';
import { getSelectedExercise } from './exercise';
import { sound } from '../audio';
import {
  IconBolt,
  IconTarget,
  IconClock,
  IconInfo,
  IconPlay,
  IconBot,
  IconCheck,
  IconAlert,
  IconArrowRight,
  getExerciseIconSvg,
} from '../icons';
import {
  getPoseLandmarker,
  checkFullBodyVisibility,
  drawPoseSkeleton,
} from '../pose/poseDetector';

let calibrationStream: MediaStream | null = null;
let animationFrameId: number | null = null;
let isCalibrating = false;

export function renderCalibrationPage(): string {
  const exercise = getSelectedExercise();

  return `
    <div class="hud-calibration-page">
      <!-- Top Navigation & Telemetry -->
      <header class="hud-cal-topbar">
        <div class="cal-top-left">
          <button class="cal-btn-back" id="btn-cancel-calibration">
            ← BATAL
          </button>
          <div class="cal-badge-pill">
            <span class="live-blink-dot"></span>
            <span>AI SENSOR CALIBRATION</span>
          </div>
        </div>

        <div class="cal-top-center">
          <h2 class="cal-exercise-title">
            <span style="display:inline-flex; align-items:center;">${getExerciseIconSvg(exercise?.id, 24)}</span>
            <span>${exercise?.name || 'Squat'}</span>
          </h2>
          <span class="cal-sub-label">PERSIAPAN BIOMEKANIKA SENSOR</span>
        </div>

        <div class="cal-top-right">
          <button class="cal-btn-skip" id="btn-skip-calibration" title="Lewati kalibrasi langsung ke HUD latihan">
            <span style="display:inline-flex; align-items:center; gap:6px;">
              <span>LEWATI KALIBRASI</span>
              ${IconArrowRight(13, 'currentColor')}
            </span>
          </button>
        </div>
      </header>

      <!-- Main Calibration Viewport -->
      <div class="hud-cal-container">
        <!-- Live Camera Feed Box with Cyber Brackets -->
        <div class="hud-cal-viewport-card">
          <div class="cyber-bracket cyber-bracket--tl"></div>
          <div class="cyber-bracket cyber-bracket--tr"></div>
          <div class="cyber-bracket cyber-bracket--bl"></div>
          <div class="cyber-bracket cyber-bracket--br"></div>

          <!-- Video & Canvas -->
          <video
            id="calibration-video"
            class="hud-cal-video"
            autoplay
            playsinline
            muted
          ></video>
          <canvas id="calibration-canvas" class="hud-cal-canvas"></canvas>

          <!-- Holographic Scanline Overlay -->
          <div class="hud-cal-scanline"></div>

          <!-- Target Alignment Guide Outline (SVG Silhouette) -->
          <div class="hud-cal-silhouette-guide" id="silhouette-guide">
            <svg viewBox="0 0 200 400" class="silhouette-svg">
              <!-- Head -->
              <circle cx="100" cy="50" r="28" class="guide-bone guide-bone--head" />
              <!-- Neck & Torso -->
              <line x1="100" y1="78" x2="100" y2="180" class="guide-bone" />
              <!-- Shoulders -->
              <line x1="55" y1="105" x2="145" y2="105" class="guide-bone" />
              <!-- Arms -->
              <line x1="55" y1="105" x2="40" y2="175" class="guide-bone" />
              <line x1="40" y1="175" x2="35" y2="245" class="guide-bone" />
              <line x1="145" y1="105" x2="160" y2="175" class="guide-bone" />
              <line x1="160" y1="175" x2="165" y2="245" class="guide-bone" />
              <!-- Hips -->
              <line x1="70" y1="180" x2="130" y2="180" class="guide-bone" />
              <!-- Legs -->
              <line x1="75" y1="180" x2="70" y2="275" class="guide-bone" />
              <line x1="70" y1="275" x2="68" y2="370" class="guide-bone" />
              <line x1="125" y1="180" x2="130" y2="275" class="guide-bone" />
              <line x1="130" y1="275" x2="132" y2="370" class="guide-bone" />
              <!-- Joints -->
              <circle cx="100" cy="105" r="4" class="guide-joint" />
              <circle cx="55" cy="105" r="4" class="guide-joint" />
              <circle cx="145" cy="105" r="4" class="guide-joint" />
              <circle cx="40" cy="175" r="4" class="guide-joint" />
              <circle cx="160" cy="175" r="4" class="guide-joint" />
              <circle cx="75" cy="180" r="4" class="guide-joint" />
              <circle cx="125" cy="180" r="4" class="guide-joint" />
              <circle cx="70" cy="275" r="4" class="guide-joint" />
              <circle cx="130" cy="275" r="4" class="guide-joint" />
              <circle cx="68" cy="370" r="4" class="guide-joint" />
              <circle cx="132" cy="370" r="4" class="guide-joint" />
            </svg>
            <span class="guide-sub-text">POSISIKAN TUBUH SESUAI SILUET INI</span>
          </div>

          <!-- Bottom Telemetry Ribbon inside Viewport -->
          <div class="hud-cal-feed-ribbon">
            <span class="feed-stat" style="display:inline-flex; align-items:center; gap:5px;">
              ${IconBolt(12, 'var(--accent-lime)')}
              <span>FPS: <strong id="cal-fps">60</strong></span>
            </span>
            <span class="feed-stat">RESOLUSI: <strong id="cal-res">HD 720p</strong></span>
            <span class="feed-stat" style="display:inline-flex; align-items:center; gap:5px;">
              ${IconTarget(12, 'var(--accent-lime)')}
              <span>SENSOR: <strong>MEDIAPIPE 33-PTS</strong></span>
            </span>
          </div>
        </div>

        <!-- Right Side / Bottom Calibration Diagnostics Checklist -->
        <aside class="hud-cal-sidebar">
          <div class="cal-status-header">
            <span class="cal-status-title">DIAGNOSTIK SENSOR</span>
            <span class="cal-status-tag" id="cal-overall-tag">MENUNGGU</span>
          </div>

          <div class="cal-checklist-group">
            <!-- Check Item 1: Camera -->
            <div class="cal-check-item" id="check-camera">
              <div class="check-state-icon" style="display:flex; align-items:center; justify-content:center;">
                ${IconClock(14, 'var(--text-muted)')}
              </div>
              <div class="check-content">
                <span class="check-title">Kamera &amp; Akses Video</span>
                <span class="check-desc">Menghubungkan webcam internal/eksternal...</span>
              </div>
            </div>

            <!-- Check Item 2: AI Landmarker -->
            <div class="cal-check-item" id="check-body">
              <div class="check-state-icon" style="display:flex; align-items:center; justify-content:center;">
                ${IconClock(14, 'var(--text-muted)')}
              </div>
              <div class="check-content">
                <span class="check-title">Deteksi 33 Landmark AI</span>
                <span class="check-desc">Mendeteksi kontur kerangka tubuh...</span>
              </div>
            </div>

            <!-- Check Item 3: Full Body Framing -->
            <div class="cal-check-item" id="check-position">
              <div class="check-state-icon" style="display:flex; align-items:center; justify-content:center;">
                ${IconClock(14, 'var(--text-muted)')}
              </div>
              <div class="check-content">
                <span class="check-title">Jarak &amp; Visibilitas Tubuh</span>
                <span class="check-desc">Pastikan kepala hingga ujung kaki terlihat</span>
              </div>
            </div>
          </div>

          <!-- AI Guidance Advice Box -->
          <div class="cal-advice-box">
            <div class="advice-icon" style="display:flex; align-items:center; justify-content:center;">
              ${IconInfo(18, 'var(--accent-lime)')}
            </div>
            <div class="advice-body">
              <strong>Tips Penempatan Kamera:</strong>
              <p>Mundur 1.8–2.2 meter dari kamera. Pastikan pencahayaan ruangan merata dari depan, jangan membelakangi jendela terang.</p>
            </div>
          </div>

          <!-- Big Action Button -->
          <div class="cal-actions-box">
            <button
              class="cal-btn-ready"
              id="btn-ready"
              disabled
            >
              <span style="display:inline-flex; align-items:center; gap:8px;">
                ${IconPlay(14, 'currentColor')}
                <span>SIAP &amp; MULAI LATIHAN</span>
              </span>
            </button>
            <button
              class="cal-btn-sim-mode"
              id="btn-switch-sim"
              title="Jika kamera tidak tersedia, gunakan mode simulasi virtual AI"
            >
              <span style="display:inline-flex; align-items:center; gap:8px;">
                ${IconBot(14, 'currentColor')}
                <span>Mode Simulasi Virtual (Tanpa Kamera)</span>
              </span>
            </button>
          </div>
        </aside>
      </div>
    </div>

    <!-- Countdown Fullscreen Overlay -->
    <div class="hud-countdown-overlay" id="countdown-overlay" style="display:none;">
      <div class="hud-countdown-content">
        <span class="hud-countdown-tag">SESI DIMULAI DALAM</span>
        <div class="hud-countdown-digit" id="countdown-number">3</div>
        <span class="hud-countdown-hint">SIAPKAN POSISI AWAL ANDA</span>
      </div>
    </div>
  `;
}

export function initCalibrationPage(): void {
  isCalibrating = true;

  // Cancel button
  document.getElementById('btn-cancel-calibration')?.addEventListener('click', () => {
    stopCalibration();
    router.navigate('/exercise');
  });

  // Skip calibration button
  document.getElementById('btn-skip-calibration')?.addEventListener('click', () => {
    stopCalibration();
    startCountdown();
  });

  // Switch to virtual simulation mode
  document.getElementById('btn-switch-sim')?.addEventListener('click', () => {
    stopCalibration();
    sessionStorage.setItem('fittrack_force_simulation', 'true');
    startCountdown();
  });

  // Ready button
  document.getElementById('btn-ready')?.addEventListener('click', () => {
    startCountdown();
  });

  // Start camera and pose estimation
  startCameraAndPoseDetection();
}

async function startCameraAndPoseDetection(): Promise<void> {
  const video = document.getElementById('calibration-video') as HTMLVideoElement;
  const canvas = document.getElementById('calibration-canvas') as HTMLCanvasElement;
  const calRes = document.getElementById('cal-res');

  try {
    calibrationStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    if (video) {
      video.srcObject = calibrationStream;
      await video.play();
      if (calRes && video.videoWidth) {
        calRes.textContent = `${video.videoWidth}x${video.videoHeight}px`;
      }
    }

    updateCheck('check-camera', true, 'Kamera Terhubung', 'Webcam aktif & streaming 60 FPS');

    // Load AI pose landmarker
    const landmarker = await getPoseLandmarker();

    let consecutiveFullBodyFrames = 0;

    const processFrame = () => {
      if (!isCalibrating || !video) return;

      if (video.readyState >= 2 && landmarker) {
        if (canvas) {
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
          }

          const ctx = canvas.getContext('2d');
          const results = landmarker.detectForVideo(video, performance.now());
          const landmarks = results.landmarks && results.landmarks[0];

          if (landmarks && landmarks.length > 0) {
            const check = checkFullBodyVisibility(landmarks);

            // Update body check
            updateCheck('check-body', true, '33 Landmark Terkunci', 'AI Pose Landmarker aktif');

            if (check.hasFullBody) {
              consecutiveFullBodyFrames++;
              if (consecutiveFullBodyFrames >= 5) {
                updateCheck('check-position', true, 'Posisi Tubuh Ideal', 'Seluruh sendi utama terlihat jelas');
                enableReadyButton();
                const sil = document.getElementById('silhouette-guide');
                if (sil) sil.classList.add('silhouette-guide--locked');
              }
            } else {
              consecutiveFullBodyFrames = 0;
              updateCheck('check-position', false, 'Mundur Sedikit', 'Kepala atau kaki belum masuk frame');
              const sil = document.getElementById('silhouette-guide');
              if (sil) sil.classList.remove('silhouette-guide--locked');
            }

            if (ctx) {
              drawPoseSkeleton(ctx, landmarks, canvas.width, canvas.height, check.hasFullBody, true);
            }
          } else {
            consecutiveFullBodyFrames = 0;
            updateCheck('check-body', false, 'Mencari Pose Tubuh', 'Silakan berdiri di depan kamera');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    animationFrameId = requestAnimationFrame(processFrame);
  } catch (err) {
    console.warn('Camera not available or blocked in calibration:', err);
    updateCheck('check-camera', false, 'Kamera Tidak Terdeteksi', 'Izin kamera ditolak atau tidak ada webcam');
    updateCheck('check-body', true, 'Mode Simulasi Tersedia', 'Klik tombol simulasi di bawah untuk mulai');
    enableReadyButton();
    const tag = document.getElementById('cal-overall-tag');
    if (tag) {
      tag.textContent = 'MODE SIMULASI SIAP';
      tag.classList.add('text-cyan');
    }
  }
}

function updateCheck(id: string, success: boolean, title: string, desc: string): void {
  const item = document.getElementById(id);
  if (!item) return;

  const icon = item.querySelector('.check-state-icon');
  if (icon) {
    icon.className = `check-state-icon ${success ? 'check-state-icon--success' : 'check-state-icon--warn'}`;
    icon.innerHTML = success ? IconCheck(12, 'currentColor') : IconAlert(12, 'currentColor');
  }

  const titleEl = item.querySelector('.check-title');
  if (titleEl) titleEl.textContent = title;

  const descEl = item.querySelector('.check-desc');
  if (descEl) descEl.textContent = desc;
}

function enableReadyButton(): void {
  const btn = document.getElementById('btn-ready') as HTMLButtonElement;
  if (btn && btn.disabled) {
    btn.disabled = false;
    btn.classList.add('cal-btn-ready--active');
  }
  const tag = document.getElementById('cal-overall-tag');
  if (tag) {
    tag.textContent = 'KALIBRASI LENGKAP';
    tag.className = 'cal-status-tag status-badge-green';
  }
}

function startCountdown(): void {
  const overlay = document.getElementById('countdown-overlay');
  const number = document.getElementById('countdown-number');
  if (!overlay || !number) return;

  stopCalibration();
  overlay.style.display = 'flex';

  let count = 3;
  number.textContent = String(count);
  sound.playCountdownTick();

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      number.textContent = String(count);
      sound.playCountdownTick();
      number.style.animation = 'none';
      void (number as HTMLElement).offsetHeight;
      number.style.animation = 'countPop 1s ease-in-out';
    } else if (count === 0) {
      number.textContent = 'GO!';
      number.style.color = 'var(--accent-green)';
      sound.playCountdownGo();
      number.style.animation = 'none';
      void (number as HTMLElement).offsetHeight;
      number.style.animation = 'countPop 1s ease-in-out';
    } else {
      clearInterval(interval);
      overlay.style.display = 'none';
      router.navigate('/workout/live');
    }
  }, 1000);
}

export function stopCalibration(): void {
  isCalibrating = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (calibrationStream) {
    calibrationStream.getTracks().forEach(track => track.stop());
    calibrationStream = null;
  }
}
