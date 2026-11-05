// FitTrack — Frontend API Client Layer
// Bridges UI interactions with REST Backend (http://localhost:3000/api/v1)
// With automatic token refresh and offline fallback capability

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';

const TOKEN_KEY = 'fittrack_access_token';
const REFRESH_TOKEN_KEY = 'fittrack_refresh_token';

let memoryAccessToken: string | null = localStorage.getItem(TOKEN_KEY);

export function getAccessToken(): string | null {
  return memoryAccessToken || localStorage.getItem(TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  memoryAccessToken = accessToken;
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  memoryAccessToken = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    // If 401 and not an auth call, try refresh token once
    if (res.status === 401 && !endpoint.startsWith('/auth')) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.data?.accessToken) {
              setTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
              headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
              const retryRes = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers });
              const retryJson: ApiResponse<T> = await retryRes.json();
              if (!retryRes.ok || !retryJson.success) {
                throw new Error(retryJson.error?.message || 'Permintaan gagal');
              }
              return retryJson.data;
            }
          }
        } catch {
          clearTokens();
        }
      }
    }

    const json: ApiResponse<T> = await res.json();
    if (!res.ok || !json.success) {
      const errMsg = json.error?.message || json.message || 'Permintaan API gagal';
      throw new Error(errMsg);
    }

    return json.data;
  } catch (err: any) {
    console.warn(`[FitTrack API] Call to ${endpoint} failed:`, err.message);
    throw err;
  }
}

// --- API Service Methods ---
export const api = {
  // System Health
  health: {
    check: () => request<{ status: string; version: string }>('/health'),
  },

  // Authentication
  auth: {
    register: (data: {
      name: string;
      email: string;
      password: string;
      height?: number;
      weight?: number;
      age?: number;
      fitnessGoal?: string;
      fitnessLevel?: string;
      dailyRepTarget?: number;
    }) => request<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    login: (data: { email: string; password: string }) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    refresh: (refreshToken?: string) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),

    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
  },

  // Profile & Settings
  users: {
    getMe: () => request<any>('/users/me'),
    updateProfile: (profileData: any) =>
      request<any>('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
    updateSettings: (settingsData: any) =>
      request<any>('/users/me/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData),
      }),
    uploadAvatar: (avatarUrl: string) =>
      request<{ avatarUrl: string }>('/users/me/avatar', {
        method: 'POST',
        body: JSON.stringify({ avatarUrl }),
      }),
    deleteAccount: () =>
      request<{ message: string }>('/users/me', {
        method: 'DELETE',
      }),
  },

  // Workout Sessions
  sessions: {
    create: (sessionData: any) =>
      request<any>('/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      }),
    list: (params?: { page?: number; limit?: number; exercise?: string; from?: string; to?: string; sort?: string }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined) searchParams.append(key, String(val));
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return request<any[]>(`/sessions${query}`);
    },
    getById: (id: string) => request<any>(`/sessions/${id}`),
    deleteById: (id: string) =>
      request<{ message: string }>(`/sessions/${id}`, {
        method: 'DELETE',
      }),
    deleteAll: () =>
      request<{ message: string }>('/sessions', {
        method: 'DELETE',
      }),
  },

  // Progress & Analytics
  progress: {
    summary: () =>
      request<{
        totalSessions: number;
        totalReps: number;
        totalCalories: number;
        totalDurationSeconds: number;
        averageFormScore: number;
        currentStreak: number;
        longestStreak: number;
        mostFrequentExercise: string | null;
      }>('/progress/summary'),

    weekly: () =>
      request<{
        labels: string[];
        datasets: {
          reps: number[];
          formScore: number[];
          calories: number[];
        };
      }>('/progress/weekly'),

    monthly: () =>
      request<{
        labels: string[];
        datasets: {
          reps: number[];
          formScore: number[];
          calories: number[];
        };
      }>('/progress/monthly'),

    streak: () =>
      request<{
        currentStreak: number;
        longestStreak: number;
        lastActiveDate: string | null;
        activeDates: string[];
      }>('/progress/streak'),

    bestForExercise: (exercise: string) =>
      request<{
        exercise: string;
        bestReps: number;
        bestFormScore: number;
        totalSessions: number;
        averageFormScore: number;
        lastSession: string | null;
      }>(`/progress/best/${exercise}`),

    byExercise: () =>
      request<Array<{
        exercise: string;
        exerciseIcon: string;
        totalSessions: number;
        totalReps: number;
        bestReps: number;
        averageFormScore: number;
      }>>('/progress/by-exercise'),
  },
};
