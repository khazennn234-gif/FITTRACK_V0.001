import rateLimit from 'express-rate-limit';

// Global API Rate Limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 300, // Limit each IP to 300 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Terlalu banyak permintaan dari IP ini. Silakan coba beberapa saat lagi.',
    },
  },
});

// Strict Rate Limiter for Authentication & Sensitive Operations (Brute Force Defense)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 15, // Limit each IP to 15 login/register attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak percobaan autentikasi. Silakan tunggu 15 menit sebelum mencoba kembali.',
    },
  },
});

// Workout Session Creation Rate Limiter (Spam Prevention)
export const sessionCreationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 60, // Limit to 60 sessions per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'SESSION_RATE_LIMIT_EXCEEDED',
      message: 'Batas frekuensi penyimpanan sesi tercapai. Harap jeda beberapa menit.',
    },
  },
});

