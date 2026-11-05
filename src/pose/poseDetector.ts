// FitTrack — High-Precision MediaPipe Pose Detection & Canvas Renderer
// Uses @mediapipe/tasks-vision PoseLandmarker with Adaptive EMA Temporal Smoothing

import { FilesetResolver, PoseLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface PoseDetectionResult {
  landmarks: NormalizedLandmark[];
  worldLandmarks?: any[];
}

export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// Skeleton bone connections for MediaPipe 33-point model
export const POSE_CONNECTIONS: [number, number][] = [
  // Torso box
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  // Left arm
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  // Right arm
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  // Left leg
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  // Right leg
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
];

let poseLandmarkerInstance: PoseLandmarker | null = null;
let isInitializing = false;

// Adaptive EMA (Exponential Moving Average) Landmark Smoother
// Filters out high-frequency camera noise while preserving quick kinematic transitions
export class LandmarkSmoother {
  private prev: NormalizedLandmark[] | null = null;
  private readonly baseAlpha: number;

  constructor(baseAlpha: number = 0.65) {
    this.baseAlpha = baseAlpha;
  }

  smooth(current: NormalizedLandmark[]): NormalizedLandmark[] {
    if (!current || current.length === 0) return current;

    if (!this.prev || this.prev.length !== current.length) {
      this.prev = current.map(lm => ({ ...lm }));
      return current;
    }

    const smoothed: NormalizedLandmark[] = current.map((curr, i) => {
      const prevLm = this.prev![i];
      const dx = curr.x - prevLm.x;
      const dy = curr.y - prevLm.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);

      // Adaptive alpha: when moving fast, increase responsiveness; when holding, increase smoothing
      const dynamicAlpha = Math.min(0.92, Math.max(0.40, this.baseAlpha + velocity * 3.0));

      return {
        x: dynamicAlpha * curr.x + (1 - dynamicAlpha) * prevLm.x,
        y: dynamicAlpha * curr.y + (1 - dynamicAlpha) * prevLm.y,
        z: curr.z !== undefined && prevLm.z !== undefined
          ? dynamicAlpha * curr.z + (1 - dynamicAlpha) * prevLm.z
          : curr.z,
        visibility: curr.visibility,
      };
    });

    this.prev = smoothed.map(lm => ({ ...lm }));
    return smoothed;
  }

  reset(): void {
    this.prev = null;
  }
}

export const globalLandmarkSmoother = new LandmarkSmoother(0.68);

// Initialize MediaPipe PoseLandmarker
export async function getPoseLandmarker(): Promise<PoseLandmarker | null> {
  if (poseLandmarkerInstance) return poseLandmarkerInstance;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    return poseLandmarkerInstance;
  }

  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    // Try full accuracy model first (higher landmark precision and 3D depth)
    try {
      poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.6,
        minPosePresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
      return poseLandmarkerInstance;
    } catch (_fullGpuErr) {
      // Fallback to lite model with GPU
      poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.55,
        minPosePresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });
      return poseLandmarkerInstance;
    }
  } catch (error) {
    console.warn('Failed GPU pose initialization, falling back to CPU...', error);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
      return poseLandmarkerInstance;
    } catch (cpuError) {
      console.error('Failed to load MediaPipe PoseLandmarker completely:', cpuError);
      return null;
    }
  } finally {
    isInitializing = false;
  }
}

// Calculate angle between 3 landmarks: pointA -> joint (pointB) -> pointC
export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  if (!a || !b || !c) return 0;
  // If visibility is too low, treat as invalid
  if (
    (a.visibility !== undefined && a.visibility < 0.25) ||
    (b.visibility !== undefined && b.visibility < 0.25) ||
    (c.visibility !== undefined && c.visibility < 0.25)
  ) {
    return 0;
  }

  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

// Calculate angle of a segment (e.g. Torso) relative to vertical line (Y-axis)
export function calculateVerticalAngle(top: NormalizedLandmark, bottom: NormalizedLandmark): number {
  if (!top || !bottom) return 0;
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y; // note: y increases downwards
  const angleRad = Math.atan2(Math.abs(dx), Math.abs(dy));
  return Math.round((angleRad * 180.0) / Math.PI);
}

// Calculate euclidean distance between 2 normalized points
export function calculateDistance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  if (!a || !b) return 0;
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// Check if critical landmarks are in-frame and visible
export function checkFullBodyVisibility(landmarks: NormalizedLandmark[]): {
  hasBody: boolean;
  hasFullBody: boolean;
  confidence: number;
} {
  if (!landmarks || landmarks.length === 0) {
    return { hasBody: false, hasFullBody: false, confidence: 0 };
  }

  const keyIndices = [
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.RIGHT_KNEE,
    POSE_LANDMARKS.LEFT_ANKLE,
    POSE_LANDMARKS.RIGHT_ANKLE,
  ];

  let visibleCount = 0;
  for (const idx of keyIndices) {
    const lm = landmarks[idx];
    if (lm && (lm.visibility === undefined || lm.visibility > 0.4) && lm.y >= 0.02 && lm.y <= 0.98) {
      visibleCount++;
    }
  }

  const confidence = visibleCount / keyIndices.length;
  return {
    hasBody: visibleCount >= 4,
    hasFullBody: visibleCount >= 6,
    confidence,
  };
}

// Draw futuristic skeleton on canvas with joint glows and active angle highlights
export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  isGoodForm: boolean = true,
  mirror: boolean = true,
  highlightJoints?: number[]
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  if (!landmarks || landmarks.length === 0) {
    ctx.restore();
    return;
  }

  const lineColor = isGoodForm ? '#00E676' : '#FF5252';
  const jointColor = isGoodForm ? '#00D9FF' : '#FFD740';

  const getCanvasPoint = (lm: NormalizedLandmark) => {
    const x = mirror ? (1 - lm.x) * width : lm.x * width;
    const y = lm.y * height;
    return { x, y };
  };

  // Draw bone lines
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = lineColor;
  ctx.shadowColor = lineColor;
  ctx.shadowBlur = 12;

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (!start || !end) continue;
    if (start.visibility !== undefined && start.visibility < 0.25) continue;
    if (end.visibility !== undefined && end.visibility < 0.25) continue;

    const p1 = getCanvasPoint(start);
    const p2 = getCanvasPoint(end);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Draw joints
  for (let i = 0; i < landmarks.length; i++) {
    if (i > 0 && i < 11 && i !== 0) continue; // Skip facial clutter
    const lm = landmarks[i];
    if (!lm || (lm.visibility !== undefined && lm.visibility < 0.25)) continue;

    const pt = getCanvasPoint(lm);
    const isHighlighted = highlightJoints && highlightJoints.includes(i);
    const radius = isHighlighted ? 9 : 6;
    const curJointColor = isHighlighted ? '#00E676' : jointColor;

    // Outer glow
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = curJointColor;
    ctx.shadowColor = curJointColor;
    ctx.shadowBlur = isHighlighted ? 18 : 10;
    ctx.fill();

    // Inner bright point
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, isHighlighted ? 4 : 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.fill();
  }

  ctx.restore();
}
