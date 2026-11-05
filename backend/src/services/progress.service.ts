import { prisma } from '../utils/prisma.js';

interface StreakCalculation {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activeDates: string[];
}

function calculateStreaks(sessions: { date: Date }[]): StreakCalculation {
  if (sessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      activeDates: [],
    };
  }

  // Extract unique ISO date strings (YYYY-MM-DD)
  const uniqueDatesSet = new Set<string>();
  sessions.forEach((s) => {
    uniqueDatesSet.add(s.date.toISOString().split('T')[0]);
  });

  const sortedDates = Array.from(uniqueDatesSet).sort(); // chronological order asc
  const lastActiveDate = sortedDates[sortedDates.length - 1] || null;

  let maxStreak = 1;
  let currentStreakCount = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      currentStreakCount++;
      if (currentStreakCount > maxStreak) {
        maxStreak = currentStreakCount;
      }
    } else if (diffDays > 1) {
      currentStreakCount = 1;
    }
  }

  // Check if today or yesterday is the last active date to see if active streak holds
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];

  let effectiveCurrentStreak = 0;
  if (lastActiveDate === todayStr || lastActiveDate === yesterday) {
    effectiveCurrentStreak = currentStreakCount;
  }

  return {
    currentStreak: effectiveCurrentStreak,
    longestStreak: Math.max(maxStreak, effectiveCurrentStreak),
    lastActiveDate,
    activeDates: sortedDates,
  };
}

export async function getProgressSummary(userId: string) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });

  const totalSessions = sessions.length;
  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      totalReps: 0,
      totalCalories: 0,
      totalDurationSeconds: 0,
      averageFormScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      mostFrequentExercise: null,
    };
  }

  const totalReps = sessions.reduce((acc, s) => acc + s.reps, 0);
  const totalCalories = Math.round(sessions.reduce((acc, s) => acc + s.calories, 0));
  const totalDurationSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
  const averageFormScore = Math.round(
    sessions.reduce((acc, s) => acc + s.formScore, 0) / totalSessions
  );

  // Find most frequent exercise
  const exerciseCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    exerciseCounts[s.exercise] = (exerciseCounts[s.exercise] || 0) + 1;
  });

  let mostFrequentExercise = null;
  let highestCount = 0;
  for (const [ex, count] of Object.entries(exerciseCounts)) {
    if (count > highestCount) {
      highestCount = count;
      mostFrequentExercise = ex;
    }
  }

  const streakData = calculateStreaks(sessions);

  return {
    totalSessions,
    totalReps,
    totalCalories,
    totalDurationSeconds,
    averageFormScore,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    mostFrequentExercise,
  };
}

export async function getWeeklyProgress(userId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 3600 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      date: { gte: sevenDaysAgo },
    },
    orderBy: { date: 'asc' },
  });

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const labels: string[] = [];
  const repsData: number[] = [];
  const formScoreData: number[] = [];
  const caloriesData: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];
    labels.push(dayLabel);

    const daySessions = sessions.filter((s) => s.date.toISOString().split('T')[0] === dateStr);
    if (daySessions.length > 0) {
      const sumReps = daySessions.reduce((acc, s) => acc + s.reps, 0);
      const avgForm = Math.round(
        daySessions.reduce((acc, s) => acc + s.formScore, 0) / daySessions.length
      );
      const sumCalories = Math.round(daySessions.reduce((acc, s) => acc + s.calories, 0));
      repsData.push(sumReps);
      formScoreData.push(avgForm);
      caloriesData.push(sumCalories);
    } else {
      repsData.push(0);
      formScoreData.push(0);
      caloriesData.push(0);
    }
  }

  return {
    labels,
    datasets: {
      reps: repsData,
      formScore: formScoreData,
      calories: caloriesData,
    },
  };
}

export async function getMonthlyProgress(userId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 29 * 24 * 3600 * 1000);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: 'asc' },
  });

  const labels: string[] = [];
  const repsData: number[] = [];
  const formScoreData: number[] = [];
  const caloriesData: number[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    labels.push(`${d.getDate()}/${d.getMonth() + 1}`);

    const daySessions = sessions.filter((s) => s.date.toISOString().split('T')[0] === dateStr);
    if (daySessions.length > 0) {
      repsData.push(daySessions.reduce((acc, s) => acc + s.reps, 0));
      formScoreData.push(
        Math.round(daySessions.reduce((acc, s) => acc + s.formScore, 0) / daySessions.length)
      );
      caloriesData.push(Math.round(daySessions.reduce((acc, s) => acc + s.calories, 0)));
    } else {
      repsData.push(0);
      formScoreData.push(0);
      caloriesData.push(0);
    }
  }

  return {
    labels,
    datasets: {
      reps: repsData,
      formScore: formScoreData,
      calories: caloriesData,
    },
  };
}

export async function getUserStreak(userId: string) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
    select: { date: true },
  });

  return calculateStreaks(sessions);
}

export async function getBestForExercise(userId: string, exercise: string) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId, exercise },
    orderBy: { date: 'desc' },
  });

  if (sessions.length === 0) {
    return {
      exercise,
      bestReps: 0,
      bestFormScore: 0,
      totalSessions: 0,
      averageFormScore: 0,
      lastSession: null,
    };
  }

  const bestReps = Math.max(...sessions.map((s) => s.reps));
  const bestFormScore = Math.max(...sessions.map((s) => s.formScore));
  const totalSessions = sessions.length;
  const averageFormScore = Math.round(
    sessions.reduce((acc, s) => acc + s.formScore, 0) / totalSessions
  );
  const lastSession = sessions[0].date.toISOString();

  return {
    exercise,
    bestReps,
    bestFormScore,
    totalSessions,
    averageFormScore,
    lastSession,
  };
}

export async function getProgressByExercise(userId: string) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  const grouped: Record<string, {
    exercise: string;
    exerciseIcon: string;
    sessions: typeof sessions;
  }> = {};

  sessions.forEach((s) => {
    if (!grouped[s.exercise]) {
      grouped[s.exercise] = {
        exercise: s.exercise,
        exerciseIcon: s.exerciseIcon,
        sessions: [],
      };
    }
    grouped[s.exercise].sessions.push(s);
  });

  return Object.values(grouped).map((group) => {
    const totalSessions = group.sessions.length;
    const totalReps = group.sessions.reduce((acc, s) => acc + s.reps, 0);
    const bestReps = Math.max(...group.sessions.map((s) => s.reps));
    const averageFormScore = Math.round(
      group.sessions.reduce((acc, s) => acc + s.formScore, 0) / totalSessions
    );

    return {
      exercise: group.exercise,
      exerciseIcon: group.exerciseIcon,
      totalSessions,
      totalReps,
      bestReps,
      averageFormScore,
    };
  });
}
