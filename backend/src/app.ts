import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { globalLimiter } from './middlewares/rateLimit.middleware.js';

const app = express();

// Disable Express fingerprinting header
app.disable('x-powered-by');

// Advanced Security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed per frontend deployment
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' }, // Prevent clickjacking
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true, // Legacy browser XSS protection
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Strict CORS configuration
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim().toLowerCase());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile native apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.toLowerCase();

      // Check configured origins
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Safe local development ports (5173, 5174, 4173, 3000)
      if (
        process.env.NODE_ENV !== 'production' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      // Deny untrusted origins
      return callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours preflight caching
  })
);

// Apply Global Rate Limiter
app.use('/api/', globalLimiter);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Hardened Body Parsing (Reduced from 10mb to 1mb to mitigate payload buffer exhaustion / DoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Root welcome route
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'FitTrack API Backend',
    status: 'online',
    documentation: '/api/v1/health',
  });
});

// Mount API v1 router
app.use('/api/v1', apiRouter);

// 404 Route Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Endpoint tidak ditemukan',
    },
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
