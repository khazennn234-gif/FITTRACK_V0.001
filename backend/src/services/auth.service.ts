import { prisma } from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.utils.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    const error: any = new Error('Email sudah terdaftar');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  const hashedPassword = await hashPassword(input.password);

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: hashedPassword,
        profile: {
          create: {
            name: input.name,
            role: 'ATHLETE',
            tier: 'Tier I Athlete',
            height: input.height ?? 170,
            weight: input.weight ?? 65,
            age: input.age ?? 25,
            fitnessGoal: input.fitnessGoal ?? 'strength',
            fitnessLevel: input.fitnessLevel ?? 'beginner',
            dailyRepTarget: input.dailyRepTarget ?? 30,
          },
        },
        settings: {
          create: {
            soundVolume: 80,
            soundFeedback: true,
            gpuAcceleration: true,
            cameraMirror: true,
            poseStrictness: 'normal',
            difficulty: 'normal',
            darkMode: true,
          },
        },
      },
      include: {
        profile: true,
        settings: true,
      },
    });
    return user;
  });

  const payload = { userId: newUser.id, email: newUser.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      profile: newUser.profile,
      settings: newUser.settings,
    },
    accessToken,
    refreshToken,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: {
      profile: true,
      settings: true,
    },
  });

  if (!user) {
    const error: any = new Error('Email atau password salah');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    const error: any = new Error('Email atau password salah');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const payload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      profile: user.profile,
      settings: user.settings,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshUserToken(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true, settings: true },
    });

    if (!user) {
      const error: any = new Error('User tidak ditemukan');
      error.statusCode = 401;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const newPayload = { userId: user.id, email: user.email };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (err: any) {
    const error: any = new Error('Refresh token tidak valid atau telah kedaluwarsa');
    error.statusCode = 401;
    error.code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }
}
