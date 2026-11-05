import jwt from 'jsonwebtoken';

const DEFAULT_SECRET = 'fittrack_jwt_access_secret_super_secure_key_2026';
const DEFAULT_REFRESH = 'fittrack_jwt_refresh_secret_super_secure_key_2026';

const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || DEFAULT_REFRESH;

if (process.env.NODE_ENV === 'production' && (JWT_SECRET === DEFAULT_SECRET || JWT_SECRET.length < 32)) {
  throw new Error('SECURITY VIOLATION: Production environment requires a strong, unique JWT_SECRET (min 32 chars).');
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: (process.env.JWT_ACCESS_EXPIRES as string) || '15m',
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    algorithm: 'HS256',
    expiresIn: (process.env.JWT_REFRESH_EXPIRES as string) || '7d',
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  // Explicitly restrict algorithm to HS256 to prevent "alg: none" or algorithm confusion attacks
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] }) as TokenPayload;
}
