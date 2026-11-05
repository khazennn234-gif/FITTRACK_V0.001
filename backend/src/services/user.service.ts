import { prisma } from '../utils/prisma.js';
import { UpdateProfileInput, UpdateSettingsInput } from '../schemas/user.schema.js';

export async function getUserProfileAndSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      profile: true,
      settings: true,
    },
  });

  if (!user) {
    const error: any = new Error('User tidak ditemukan');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return user;
}

export async function updateUserProfile(userId: string, data: UpdateProfileInput) {
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data,
  });

  return updatedProfile;
}

export async function updateUserSettings(userId: string, data: UpdateSettingsInput) {
  const updatedSettings = await prisma.settings.update({
    where: { userId },
    data,
  });

  return updatedSettings;
}

export async function deleteUserAccount(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: 'Akun berhasil dihapus' };
}
