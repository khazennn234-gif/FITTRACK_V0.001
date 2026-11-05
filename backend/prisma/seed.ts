import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FitTrack database seeding...');

  // Clean existing data
  await prisma.repFeedback.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      password: hashedPassword,
      profile: {
        create: {
          name: 'Alex Pratama',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          role: 'ATHLETE',
          tier: 'Tier II Athlete',
          height: 170,
          weight: 65,
          age: 25,
          fitnessGoal: 'strength',
          fitnessLevel: 'intermediate',
          dailyRepTarget: 30,
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
    },
  });

  console.log(`👤 Created user: ${demoUser.email} (Password: Password123!)`);

  const now = new Date();

  // Seed sample workout sessions
  const sessionsData = [
    {
      date: new Date(now.getTime() - 24 * 3600 * 1000),
      exercise: 'squat',
      exerciseIcon: '🦵',
      reps: 15,
      targetReps: 15,
      duration: 134,
      formScore: 92,
      goodReps: 14,
      badReps: 1,
      calories: 42,
      statusBadge: 'SEMPURNA',
      feedback: [
        { rep: 7, message: 'Turun 5° lebih dalam untuk aktivasi gluteus', type: 'bad' },
      ],
    },
    {
      date: new Date(now.getTime() - 2 * 24 * 3600 * 1000),
      exercise: 'pushup',
      exerciseIcon: '💪',
      reps: 10,
      targetReps: 12,
      duration: 185,
      formScore: 78,
      goodReps: 8,
      badReps: 2,
      calories: 31,
      statusBadge: 'PERLU PERBAIKAN PUNGGUNG',
      feedback: [
        { rep: 4, message: 'Jaga badan tetap lurus, jangan jatuhkan pinggul', type: 'bad' },
        { rep: 8, message: 'Siku ditekuk hingga 90°', type: 'bad' },
      ],
    },
    {
      date: new Date(now.getTime() - 3 * 24 * 3600 * 1000),
      exercise: 'jumping-jack',
      exerciseIcon: '⭐',
      reps: 30,
      targetReps: 30,
      duration: 110,
      formScore: 95,
      goodReps: 29,
      badReps: 1,
      calories: 38,
      statusBadge: 'PRESISI TINGGI',
      feedback: [
        { rep: 12, message: 'Angkat kedua tangan penuh ke atas kepala', type: 'bad' },
      ],
    },
    {
      date: new Date(now.getTime() - 5 * 24 * 3600 * 1000),
      exercise: 'squat',
      exerciseIcon: '🦵',
      reps: 25,
      targetReps: 25,
      duration: 195,
      formScore: 85,
      goodReps: 21,
      badReps: 4,
      calories: 55,
      statusBadge: 'PERSONAL BEST',
      feedback: [
        { rep: 10, message: 'Dada sedikit condong ke depan saat naik', type: 'bad' },
      ],
    },
  ];

  for (const s of sessionsData) {
    const { feedback, ...sess } = s;
    await prisma.workoutSession.create({
      data: {
        userId: demoUser.id,
        ...sess,
        feedback: {
          create: feedback,
        },
      },
    });
  }

  console.log(`✅ Seeded ${sessionsData.length} workout sessions successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
