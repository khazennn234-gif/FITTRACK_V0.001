// FitTrack — High-Precision Exercise Movement Analyzer & Rep Counter
// Features: Multi-frame debouncing, hysteresis thresholds, cooldown timing,
// bilateral symmetry evaluation, posture alignment, and comprehensive exercise coverage.

import {
  POSE_LANDMARKS,
  calculateAngle,
  calculateVerticalAngle,
  calculateDistance,
} from './poseDetector';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface ExerciseAnalysisResult {
  repIncremented: boolean;
  isGoodForm: boolean;
  feedbackText: string;
  feedbackDetail: string;
  primaryAngle: number;
  primaryMetricName: string;
  secondaryAngle?: number;
  stageName: string;
  highlightJoints?: number[];
}

export type ExerciseDifficulty = 'easy' | 'normal' | 'strict';

export interface ExerciseAnalyzer {
  reset(): void;
  process(landmarks: NormalizedLandmark[], difficulty: ExerciseDifficulty): ExerciseAnalysisResult;
}

// ----------------------------------------------------------------------
// 1. SQUAT ANALYZER
// ----------------------------------------------------------------------
export class SquatAnalyzer implements ExerciseAnalyzer {
  private state: 'UP' | 'DOWN' = 'UP';
  private minKneeAngleDuringRep: number = 180;
  private minTorsoAngleDuringRep: number = 180;
  private confirmCount: number = 0;
  private lastRepTimestamp: number = 0;
  private smoothedAngle: number = 180;

  reset(): void {
    this.state = 'UP';
    this.minKneeAngleDuringRep = 180;
    this.minTorsoAngleDuringRep = 180;
    this.confirmCount = 0;
    this.lastRepTimestamp = 0;
    this.smoothedAngle = 180;
  }

  process(landmarks: NormalizedLandmark[], difficulty: ExerciseDifficulty): ExerciseAnalysisResult {
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];

    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    let rawKneeAngle = 180;
    if (leftKneeAngle > 0 && rightKneeAngle > 0) {
      rawKneeAngle = Math.round((leftKneeAngle + rightKneeAngle) / 2);
    } else {
      rawKneeAngle = leftKneeAngle || rightKneeAngle || 180;
    }

    // Smooth angle
    this.smoothedAngle = Math.round(0.7 * rawKneeAngle + 0.3 * this.smoothedAngle);

    // Torso angle (Shoulder - Hip - Knee)
    const leftTorso = calculateAngle(leftShoulder, leftHip, leftKnee);
    const rightTorso = calculateAngle(rightShoulder, rightHip, rightKnee);
    const torsoAngle = Math.round((leftTorso + rightTorso) / 2) || leftTorso || rightTorso || 160;

    const downThreshold = difficulty === 'easy' ? 105 : difficulty === 'strict' ? 85 : 95;
    const upThreshold = 152;
    const now = Date.now();

    let repIncremented = false;
    let isGoodForm = true;
    let feedbackText = 'Posisi Bagus!';
    let feedbackDetail = 'Pertahankan ritme gerakan';

    if (this.state === 'UP') {
      if (this.smoothedAngle <= downThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2) {
          this.state = 'DOWN';
          this.confirmCount = 0;
          this.minKneeAngleDuringRep = this.smoothedAngle;
          this.minTorsoAngleDuringRep = torsoAngle;
        }
      } else {
        this.confirmCount = 0;
      }
    } else if (this.state === 'DOWN') {
      this.minKneeAngleDuringRep = Math.min(this.minKneeAngleDuringRep, this.smoothedAngle);
      this.minTorsoAngleDuringRep = Math.min(this.minTorsoAngleDuringRep, torsoAngle);

      if (this.smoothedAngle >= upThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2 && now - this.lastRepTimestamp > 700) {
          this.state = 'UP';
          this.confirmCount = 0;
          this.lastRepTimestamp = now;
          repIncremented = true;

          // Form validation
          const isKneeSymmetric = Math.abs(leftKneeAngle - rightKneeAngle) < 18;

          if (this.minKneeAngleDuringRep > downThreshold + 8) {
            isGoodForm = false;
            feedbackText = 'Turun Lebih Dalam';
            feedbackDetail = `Sudut lutut ${this.minKneeAngleDuringRep}° (target < ${downThreshold}°)`;
          } else if (this.minTorsoAngleDuringRep < 65) {
            isGoodForm = false;
            feedbackText = 'Punggung Membungkuk';
            feedbackDetail = 'Jaga dada tetap tegak saat turun';
          } else if (!isKneeSymmetric && leftKneeAngle > 0 && rightKneeAngle > 0) {
            isGoodForm = false;
            feedbackText = 'Beban Tidak Simetris';
            feedbackDetail = 'Tumpukan berat merata pada kedua lutut';
          } else {
            isGoodForm = true;
            feedbackText = 'Perfect Squat!';
            feedbackDetail = `Kedalaman ${this.minKneeAngleDuringRep}° presisi`;
          }

          this.minKneeAngleDuringRep = 180;
          this.minTorsoAngleDuringRep = 180;
        }
      } else {
        this.confirmCount = 0;
      }
    }

    return {
      repIncremented,
      isGoodForm,
      feedbackText,
      feedbackDetail,
      primaryAngle: this.smoothedAngle,
      primaryMetricName: 'KNEE ANGLE',
      secondaryAngle: torsoAngle,
      stageName: this.state === 'DOWN' ? 'Jongkok (Squat)' : 'Berdiri Tegak',
      highlightJoints: [
        POSE_LANDMARKS.LEFT_KNEE,
        POSE_LANDMARKS.RIGHT_KNEE,
        POSE_LANDMARKS.LEFT_HIP,
        POSE_LANDMARKS.RIGHT_HIP,
      ],
    };
  }
}

// ----------------------------------------------------------------------
// 2. PUSH-UP ANALYZER
// ----------------------------------------------------------------------
export class PushupAnalyzer implements ExerciseAnalyzer {
  private state: 'UP' | 'DOWN' = 'UP';
  private minElbowAngleDuringRep: number = 180;
  private minBodyLineAngle: number = 180;
  private confirmCount: number = 0;
  private lastRepTimestamp: number = 0;
  private smoothedAngle: number = 180;

  reset(): void {
    this.state = 'UP';
    this.minElbowAngleDuringRep = 180;
    this.minBodyLineAngle = 180;
    this.confirmCount = 0;
    this.lastRepTimestamp = 0;
    this.smoothedAngle = 180;
  }

  process(landmarks: NormalizedLandmark[], difficulty: ExerciseDifficulty): ExerciseAnalysisResult {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const rawElbowAngle = Math.round((leftElbowAngle + rightElbowAngle) / 2) || leftElbowAngle || rightElbowAngle || 180;

    this.smoothedAngle = Math.round(0.7 * rawElbowAngle + 0.3 * this.smoothedAngle);

    // Body plank line (Shoulder - Hip - Ankle)
    const leftLine = calculateAngle(leftShoulder, leftHip, leftAnkle);
    const rightLine = calculateAngle(rightShoulder, rightHip, rightAnkle);
    const bodyLineAngle = Math.round((leftLine + rightLine) / 2) || leftLine || rightLine || 170;

    const downThreshold = difficulty === 'easy' ? 105 : difficulty === 'strict' ? 85 : 95;
    const upThreshold = 148;
    const now = Date.now();

    let repIncremented = false;
    let isGoodForm = true;
    let feedbackText = 'Gerakan Baik';
    let feedbackDetail = 'Pertahankan postur lurus';

    if (this.state === 'UP') {
      if (this.smoothedAngle <= downThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2) {
          this.state = 'DOWN';
          this.confirmCount = 0;
          this.minElbowAngleDuringRep = this.smoothedAngle;
          this.minBodyLineAngle = bodyLineAngle;
        }
      } else {
        this.confirmCount = 0;
      }
    } else if (this.state === 'DOWN') {
      this.minElbowAngleDuringRep = Math.min(this.minElbowAngleDuringRep, this.smoothedAngle);
      this.minBodyLineAngle = Math.min(this.minBodyLineAngle, bodyLineAngle);

      if (this.smoothedAngle >= upThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2 && now - this.lastRepTimestamp > 700) {
          this.state = 'UP';
          this.confirmCount = 0;
          this.lastRepTimestamp = now;
          repIncremented = true;

          if (this.minElbowAngleDuringRep > downThreshold + 10) {
            isGoodForm = false;
            feedbackText = 'Turun Lebih Rendah';
            feedbackDetail = `Siku ${this.minElbowAngleDuringRep}°, usahakan 90°`;
          } else if (this.minBodyLineAngle < 145) {
            isGoodForm = false;
            feedbackText = 'Pinggul Jatuh / Sagging';
            feedbackDetail = 'Kencangkan otot core agar tubuh lurus';
          } else {
            isGoodForm = true;
            feedbackText = 'Push-Up Mantap!';
            feedbackDetail = 'Form tubuh dan kedalaman siku presisi';
          }

          this.minElbowAngleDuringRep = 180;
          this.minBodyLineAngle = 180;
        }
      } else {
        this.confirmCount = 0;
      }
    }

    return {
      repIncremented,
      isGoodForm,
      feedbackText,
      feedbackDetail,
      primaryAngle: this.smoothedAngle,
      primaryMetricName: 'ELBOW ANGLE',
      secondaryAngle: bodyLineAngle,
      stageName: this.state === 'DOWN' ? 'Posisi Bawah (Flex)' : 'Plank Atas',
      highlightJoints: [
        POSE_LANDMARKS.LEFT_ELBOW,
        POSE_LANDMARKS.RIGHT_ELBOW,
        POSE_LANDMARKS.LEFT_SHOULDER,
        POSE_LANDMARKS.RIGHT_SHOULDER,
      ],
    };
  }
}

// ----------------------------------------------------------------------
// 3. LATERAL RAISES ANALYZER (Deltoid Lateral)
// ----------------------------------------------------------------------
export class LateralRaiseAnalyzer implements ExerciseAnalyzer {
  private state: 'DOWN' | 'UP' = 'DOWN';
  private maxAbductionAngle: number = 0;
  private confirmCount: number = 0;
  private lastRepTimestamp: number = 0;
  private smoothedAngle: number = 20;

  reset(): void {
    this.state = 'DOWN';
    this.maxAbductionAngle = 0;
    this.confirmCount = 0;
    this.lastRepTimestamp = 0;
    this.smoothedAngle = 20;
  }

  process(landmarks: NormalizedLandmark[], difficulty: ExerciseDifficulty): ExerciseAnalysisResult {
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];

    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];

    // Abduction angle: Hip -> Shoulder -> Elbow
    const leftAbduction = calculateAngle(leftHip, leftShoulder, leftElbow);
    const rightAbduction = calculateAngle(rightHip, rightShoulder, rightElbow);

    let rawAbduction = 20;
    if (leftAbduction > 0 && rightAbduction > 0) {
      rawAbduction = Math.round((leftAbduction + rightAbduction) / 2);
    } else {
      rawAbduction = leftAbduction || rightAbduction || 20;
    }

    this.smoothedAngle = Math.round(0.7 * rawAbduction + 0.3 * this.smoothedAngle);

    // Torso sway check (Mid-hip to mid-shoulder verticality)
    const midShoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
    const midHip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const torsoSway = calculateVerticalAngle(midShoulder as NormalizedLandmark, midHip as NormalizedLandmark);

    const upThreshold = difficulty === 'strict' ? 85 : difficulty === 'easy' ? 70 : 80;
    const downThreshold = 35;
    const now = Date.now();

    let repIncremented = false;
    let isGoodForm = true;
    let feedbackText = 'Bahu Terangkat Baik';
    let feedbackDetail = 'Kontrol fase eksentrik saat turun';

    if (this.state === 'DOWN') {
      if (this.smoothedAngle >= upThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2) {
          this.state = 'UP';
          this.confirmCount = 0;
          this.maxAbductionAngle = this.smoothedAngle;
        }
      } else {
        this.confirmCount = 0;
      }
    } else if (this.state === 'UP') {
      this.maxAbductionAngle = Math.max(this.maxAbductionAngle, this.smoothedAngle);

      if (this.smoothedAngle <= downThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2 && now - this.lastRepTimestamp > 800) {
          this.state = 'DOWN';
          this.confirmCount = 0;
          this.lastRepTimestamp = now;
          repIncremented = true;

          // Form verification
          const armSymmetry = Math.abs(leftAbduction - rightAbduction);

          if (this.maxAbductionAngle > 105) {
            isGoodForm = false;
            feedbackText = 'Terlalu Tinggi (Overhead)';
            feedbackDetail = 'Angkat maksimal sejajar bahu (~90°) agar tidak cedera';
          } else if (this.maxAbductionAngle < 75) {
            isGoodForm = false;
            feedbackText = 'Kurang Tinggi';
            feedbackDetail = `Puncak ${this.maxAbductionAngle}°, usahakan sejajar bahu 85°–90°`;
          } else if (torsoSway > 12) {
            isGoodForm = false;
            feedbackText = 'Badan Mengayun';
            feedbackDetail = 'Kunci torso tegak, gunakan hanya kekuatan deltoid';
          } else if (armSymmetry > 18 && leftAbduction > 0 && rightAbduction > 0) {
            isGoodForm = false;
            feedbackText = 'Lengan Kurang Seimbang';
            feedbackDetail = 'Angkat kedua tangan dengan ketinggian sama';
          } else {
            isGoodForm = true;
            feedbackText = 'Perfect Lateral Raise!';
            feedbackDetail = `Ketinggian ${this.maxAbductionAngle}° sejajar bahu ideal`;
          }

          this.maxAbductionAngle = 0;
        }
      } else {
        this.confirmCount = 0;
      }
    }

    return {
      repIncremented,
      isGoodForm,
      feedbackText,
      feedbackDetail,
      primaryAngle: this.smoothedAngle,
      primaryMetricName: 'SHOULDER ABDUCTION',
      secondaryAngle: torsoSway,
      stageName: this.state === 'UP' ? 'Puncak (Bahu Sejajar)' : 'Lengan di Samping',
      highlightJoints: [
        POSE_LANDMARKS.LEFT_SHOULDER,
        POSE_LANDMARKS.RIGHT_SHOULDER,
        POSE_LANDMARKS.LEFT_ELBOW,
        POSE_LANDMARKS.RIGHT_ELBOW,
      ],
    };
  }
}

// ----------------------------------------------------------------------
// 4. SHOULDER PRESS / OVERHEAD PRESS ANALYZER
// ----------------------------------------------------------------------
export class ShoulderPressAnalyzer implements ExerciseAnalyzer {
  private state: 'DOWN' | 'UP' = 'DOWN';
  private maxElbowExtension: number = 0;
  private minStartingElbow: number = 180;
  private confirmCount: number = 0;
  private lastRepTimestamp: number = 0;
  private smoothedAngle: number = 90;

  reset(): void {
    this.state = 'DOWN';
    this.maxElbowExtension = 0;
    this.minStartingElbow = 180;
    this.confirmCount = 0;
    this.lastRepTimestamp = 0;
    this.smoothedAngle = 90;
  }

  process(landmarks: NormalizedLandmark[], difficulty: ExerciseDifficulty): ExerciseAnalysisResult {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];

    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

    // Elbow extension angles (Shoulder - Elbow - Wrist)
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const rawElbowAngle = Math.round((leftElbowAngle + rightElbowAngle) / 2) || leftElbowAngle || rightElbowAngle || 90;

    this.smoothedAngle = Math.round(0.7 * rawElbowAngle + 0.3 * this.smoothedAngle);

    // Wrists above shoulders verification
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const wristsAboveHead = leftWrist.y < avgShoulderY && rightWrist.y < avgShoulderY;

    const upLockoutThreshold = difficulty === 'strict' ? 165 : difficulty === 'easy' ? 148 : 158;
    const downDepthThreshold = 105;
    const now = Date.now();

    let repIncremented = false;
    let isGoodForm = true;
    let feedbackText = 'Press Kuat!';
    let feedbackDetail = 'Dorong vertikal lurus ke atas kepala';

    if (this.state === 'DOWN') {
      this.minStartingElbow = Math.min(this.minStartingElbow, this.smoothedAngle);

      if (this.smoothedAngle >= upLockoutThreshold && wristsAboveHead) {
        this.confirmCount++;
        if (this.confirmCount >= 2) {
          this.state = 'UP';
          this.confirmCount = 0;
          this.maxElbowExtension = this.smoothedAngle;
        }
      } else {
        this.confirmCount = 0;
      }
    } else if (this.state === 'UP') {
      this.maxElbowExtension = Math.max(this.maxElbowExtension, this.smoothedAngle);

      if (this.smoothedAngle <= downDepthThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2 && now - this.lastRepTimestamp > 800) {
          this.state = 'DOWN';
          this.confirmCount = 0;
          this.lastRepTimestamp = now;
          repIncremented = true;

          // Form validation
          const pressSymmetry = Math.abs(leftElbowAngle - rightElbowAngle);

          if (this.maxElbowExtension < 150) {
            isGoodForm = false;
            feedbackText = 'Kunci Lengan Penuh';
            feedbackDetail = 'Ekstensikan siku lurus di atas kepala pada puncak press';
          } else if (this.minStartingElbow > 115) {
            isGoodForm = false;
            feedbackText = 'Turunkan Siku Sejajar Bahu';
            feedbackDetail = 'Rentang gerak kurang, turun hingga siku ~90°';
          } else if (pressSymmetry > 18 && leftElbowAngle > 0 && rightElbowAngle > 0) {
            isGoodForm = false;
            feedbackText = 'Dorongan Tidak Seimbang';
            feedbackDetail = 'Dorong kedua tangan sinkron bersamaan';
          } else {
            isGoodForm = true;
            feedbackText = 'Power Shoulder Press!';
            feedbackDetail = `Overhead lockout ${this.maxElbowExtension}° solid`;
          }

          this.maxElbowExtension = 0;
          this.minStartingElbow = 180;
        }
      } else {
        this.confirmCount = 0;
      }
    }

    return {
      repIncremented,
      isGoodForm,
      feedbackText,
      feedbackDetail,
      primaryAngle: this.smoothedAngle,
      primaryMetricName: 'OVERHEAD ELBOW ANGLE',
      stageName: this.state === 'UP' ? 'Lockout Overhead' : 'Bawah (Setinggi Bahu)',
      highlightJoints: [
        POSE_LANDMARKS.LEFT_WRIST,
        POSE_LANDMARKS.RIGHT_WRIST,
        POSE_LANDMARKS.LEFT_ELBOW,
        POSE_LANDMARKS.RIGHT_ELBOW,
      ],
    };
  }
}

// ----------------------------------------------------------------------
// 5. BICEP CURL ANALYZER
// ----------------------------------------------------------------------
export class BicepCurlAnalyzer implements ExerciseAnalyzer {
  private state: 'DOWN' | 'UP' = 'DOWN';
  private minCurlAngle: number = 180;
  private maxStretchAngle: number = 0;
  private confirmCount: number = 0;
  private lastRepTimestamp: number = 0;
  private smoothedAngle: number = 160;

  reset(): void {
    this.state = 'DOWN';
    this.minCurlAngle = 180;
    this.maxStretchAngle = 0;
    this.confirmCount = 0;
    this.lastRepTimestamp = 0;
    this.smoothedAngle = 160;
  }

  process(landmarks: NormalizedLandmark[], difficulty: ExerciseDifficulty): ExerciseAnalysisResult {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];

    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    const leftFlex = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightFlex = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const rawFlex = Math.round((leftFlex + rightFlex) / 2) || leftFlex || rightFlex || 160;

    this.smoothedAngle = Math.round(0.7 * rawFlex + 0.3 * this.smoothedAngle);

    // Check elbow drift forward from torso
    const leftDrift = calculateAngle(leftHip, leftShoulder, leftElbow);
    const rightDrift = calculateAngle(rightHip, rightShoulder, rightElbow);
    const elbowDrift = Math.round((leftDrift + rightDrift) / 2) || 15;

    const curlPeakThreshold = difficulty === 'strict' ? 52 : difficulty === 'easy' ? 68 : 58;
    const stretchThreshold = 142;
    const now = Date.now();

    let repIncremented = false;
    let isGoodForm = true;
    let feedbackText = 'Kontraksi Baik';
    let feedbackDetail = 'Fokus pada kontraksi puncak otot bicep';

    if (this.state === 'DOWN') {
      this.maxStretchAngle = Math.max(this.maxStretchAngle, this.smoothedAngle);

      if (this.smoothedAngle <= curlPeakThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2) {
          this.state = 'UP';
          this.confirmCount = 0;
          this.minCurlAngle = this.smoothedAngle;
        }
      } else {
        this.confirmCount = 0;
      }
    } else if (this.state === 'UP') {
      this.minCurlAngle = Math.min(this.minCurlAngle, this.smoothedAngle);

      if (this.smoothedAngle >= stretchThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2 && now - this.lastRepTimestamp > 800) {
          this.state = 'DOWN';
          this.confirmCount = 0;
          this.lastRepTimestamp = now;
          repIncremented = true;

          if (this.minCurlAngle > curlPeakThreshold + 10) {
            isGoodForm = false;
            feedbackText = 'Kontraksi Kurang Penuh';
            feedbackDetail = `Tekuk siku lebih rapat (${this.minCurlAngle}°, target < 60°)`;
          } else if (this.maxStretchAngle < 135) {
            isGoodForm = false;
            feedbackText = 'Rentang Bawah Kurang Lurus';
            feedbackDetail = 'Luruskan lengan penuh sebelum curl repetisi berikutnya';
          } else if (elbowDrift > 35) {
            isGoodForm = false;
            feedbackText = 'Siku Mengayun ke Depan';
            feedbackDetail = 'Kunci posisi siku menempel di samping tulang rusuk';
          } else {
            isGoodForm = true;
            feedbackText = 'Bicep Curl Sempurna!';
            feedbackDetail = `Puncak ${this.minCurlAngle}° & isolasi siku stabil`;
          }

          this.minCurlAngle = 180;
          this.maxStretchAngle = 0;
        }
      } else {
        this.confirmCount = 0;
      }
    }

    return {
      repIncremented,
      isGoodForm,
      feedbackText,
      feedbackDetail,
      primaryAngle: this.smoothedAngle,
      primaryMetricName: 'BICEP FLEX ANGLE',
      secondaryAngle: elbowDrift,
      stageName: this.state === 'UP' ? 'Puncak Kontraksi (Curl)' : 'Lengan Lurus (Stretch)',
      highlightJoints: [
        POSE_LANDMARKS.LEFT_ELBOW,
        POSE_LANDMARKS.RIGHT_ELBOW,
        POSE_LANDMARKS.LEFT_WRIST,
        POSE_LANDMARKS.RIGHT_WRIST,
      ],
    };
  }
}

// ----------------------------------------------------------------------
// 6. LUNGES ANALYZER
// ----------------------------------------------------------------------
export class LungeAnalyzer implements ExerciseAnalyzer {
  private state: 'UP' | 'DOWN' = 'UP';
  private minLeadKneeAngle: number = 180;
  private confirmCount: number = 0;
  private lastRepTimestamp: number = 0;
  private smoothedAngle: number = 175;

  reset(): void {
    this.state = 'UP';
    this.minLeadKneeAngle = 180;
    this.confirmCount = 0;
    this.lastRepTimestamp = 0;
    this.smoothedAngle = 175;
  }

  process(landmarks: NormalizedLandmark[], difficulty: ExerciseDifficulty): ExerciseAnalysisResult {
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    // In lunge, lead knee is the one deeply bent (smaller angle)
    const leadKneeAngle = Math.min(leftKneeAngle || 180, rightKneeAngle || 180);
    this.smoothedAngle = Math.round(0.7 * leadKneeAngle + 0.3 * this.smoothedAngle);

    const downThreshold = difficulty === 'strict' ? 88 : difficulty === 'easy' ? 105 : 95;
    const upThreshold = 155;
    const now = Date.now();

    let repIncremented = false;
    let isGoodForm = true;
    let feedbackText = 'Lunge Bagus';
    let feedbackDetail = 'Jaga keseimbangan tubuh tetap tegak';

    if (this.state === 'UP') {
      if (this.smoothedAngle <= downThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2) {
          this.state = 'DOWN';
          this.confirmCount = 0;
          this.minLeadKneeAngle = this.smoothedAngle;
        }
      } else {
        this.confirmCount = 0;
      }
    } else if (this.state === 'DOWN') {
      this.minLeadKneeAngle = Math.min(this.minLeadKneeAngle, this.smoothedAngle);

      if (this.smoothedAngle >= upThreshold) {
        this.confirmCount++;
        if (this.confirmCount >= 2 && now - this.lastRepTimestamp > 850) {
          this.state = 'UP';
          this.confirmCount = 0;
          this.lastRepTimestamp = now;
          repIncremented = true;

          if (this.minLeadKneeAngle > downThreshold + 10) {
            isGoodForm = false;
            feedbackText = 'Turun Lebih Dalam';
            feedbackDetail = `Sudut lutut ${this.minLeadKneeAngle}°, usahakan 90°`;
          } else {
            isGoodForm = true;
            feedbackText = 'Lunge Solid!';
            feedbackDetail = `Kedalaman ${this.minLeadKneeAngle}° sangat seimbang`;
          }

          this.minLeadKneeAngle = 180;
        }
      } else {
        this.confirmCount = 0;
      }
    }

    return {
      repIncremented,
      isGoodForm,
      feedbackText,
      feedbackDetail,
      primaryAngle: this.smoothedAngle,
      primaryMetricName: 'LEAD KNEE ANGLE',
      stageName: this.state === 'DOWN' ? 'Lunge Bawah (90°)' : 'Berdiri Tegak',
      highlightJoints: [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE],
    };
  }
}

// ----------------------------------------------------------------------
// 7. JUMPING JACK ANALYZER
// ----------------------------------------------------------------------
export class JumpingJackAnalyzer implements ExerciseAnalyzer {
  private state: 'CLOSED' | 'OPEN' = 'CLOSED';
  private confirmCount: number = 0;
  private lastRepTimestamp: number = 0;

  reset(): void {
    this.state = 'CLOSED';
    this.confirmCount = 0;
    this.lastRepTimestamp = 0;
  }

  process(landmarks: NormalizedLandmark[], _difficulty: ExerciseDifficulty): ExerciseAnalysisResult {
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    const hipWidth = calculateDistance(leftHip, rightHip) || 0.2;
    const ankleDist = calculateDistance(leftAnkle, rightAnkle);

    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const handsOverhead = leftWrist.y < avgShoulderY && rightWrist.y < avgShoulderY;
    const feetWide = ankleDist > hipWidth * 1.5;

    const feetClosed = ankleDist < hipWidth * 1.35;
    const handsDown = leftWrist.y > avgShoulderY + 0.1 && rightWrist.y > avgShoulderY + 0.1;
    const now = Date.now();

    let repIncremented = false;
    let isGoodForm = true;
    let feedbackText = 'Ritme Bagus!';
    let feedbackDetail = 'Lompat dengan stabil & berirama';

    if (this.state === 'CLOSED') {
      if (handsOverhead && feetWide) {
        this.confirmCount++;
        if (this.confirmCount >= 2) {
          this.state = 'OPEN';
          this.confirmCount = 0;
        }
      } else {
        this.confirmCount = 0;
      }
    } else if (this.state === 'OPEN') {
      if (feetClosed && handsDown) {
        this.confirmCount++;
        if (this.confirmCount >= 2 && now - this.lastRepTimestamp > 450) {
          this.state = 'CLOSED';
          this.confirmCount = 0;
          this.lastRepTimestamp = now;
          repIncremented = true;
          isGoodForm = true;
          feedbackText = 'Lompatan Hebat!';
          feedbackDetail = 'Sinkronisasi tangan & kaki terbuka lebar';
        }
      } else {
        this.confirmCount = 0;
      }
    }

    const feetRatio = Math.round((ankleDist / hipWidth) * 100);

    return {
      repIncremented,
      isGoodForm,
      feedbackText,
      feedbackDetail,
      primaryAngle: feetRatio,
      primaryMetricName: 'EXPANSION RATIO',
      stageName: this.state === 'OPEN' ? 'Terbuka (Star Jump)' : 'Rapat (Tegak)',
      highlightJoints: [
        POSE_LANDMARKS.LEFT_WRIST,
        POSE_LANDMARKS.RIGHT_WRIST,
        POSE_LANDMARKS.LEFT_ANKLE,
        POSE_LANDMARKS.RIGHT_ANKLE,
      ],
    };
  }
}

// Factory helper to get analyzer by exercise ID
export function createExerciseAnalyzer(exerciseId: string): ExerciseAnalyzer {
  switch (exerciseId) {
    case 'pushup':
      return new PushupAnalyzer();
    case 'lateral-raise':
      return new LateralRaiseAnalyzer();
    case 'shoulder-press':
      return new ShoulderPressAnalyzer();
    case 'bicep-curl':
      return new BicepCurlAnalyzer();
    case 'lunge':
      return new LungeAnalyzer();
    case 'jumping-jack':
      return new JumpingJackAnalyzer();
    case 'squat':
    default:
      return new SquatAnalyzer();
  }
}
