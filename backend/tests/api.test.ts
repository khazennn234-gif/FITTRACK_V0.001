// FitTrack Backend Comprehensive Automated API Test Suite
// Tests all authentication, profile, settings, session, and progress endpoints

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail: string = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log(`🧪 Starting FitTrack Backend API Test Suite`);
  console.log(`🎯 Target URL: ${BASE_URL}`);
  console.log('====================================================\n');

  // Test 1: Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = (await res.json()) as any;
    assert(res.ok && data.success === true, '1. GET /health', `status: ${data.message}`);
  } catch (err: any) {
    assert(false, '1. GET /health', err.message);
  }

  // Generate unique test user
  const uniqueSuffix = Date.now().toString(36);
  const testUser = {
    name: `Athlete ${uniqueSuffix}`,
    email: `athlete_${uniqueSuffix}@fittrack.dev`,
    password: 'Password123!',
    fitnessGoal: 'strength',
  };

  let accessToken = '';
  let refreshToken = '';

  // Test 2: Auth Register
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const data = (await res.json()) as any;
    accessToken = data.data?.accessToken;
    refreshToken = data.data?.refreshToken;
    assert(res.status === 201 && data.success && !!accessToken, '2. POST /auth/register', `User: ${testUser.email}`);
  } catch (err: any) {
    assert(false, '2. POST /auth/register', err.message);
  }

  // Test 3: Auth Login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const data = (await res.json()) as any;
    accessToken = data.data?.accessToken;
    assert(res.status === 200 && data.success && !!accessToken, '3. POST /auth/login', 'Tokens verified');
  } catch (err: any) {
    assert(false, '3. POST /auth/login', err.message);
  }

  // Test 4: Auth Refresh Token
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = (await res.json()) as any;
    if (data.data?.accessToken) {
      accessToken = data.data.accessToken;
    }
    assert(res.status === 200 && data.success && !!accessToken, '4. POST /auth/refresh', 'New access token issued');
  } catch (err: any) {
    assert(false, '4. POST /auth/refresh', err.message);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  // Test 5: Get Profile & Settings
  try {
    const res = await fetch(`${BASE_URL}/users/me`, { headers: authHeaders });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && data.data?.profile?.name === testUser.name,
      '5. GET /users/me',
      `Name: ${data.data?.profile?.name}, Tier: ${data.data?.profile?.tier}`
    );
  } catch (err: any) {
    assert(false, '5. GET /users/me', err.message);
  }

  // Test 6: Update Profile
  try {
    const res = await fetch(`${BASE_URL}/users/me/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        height: 178,
        weight: 72,
        age: 26,
        dailyRepTarget: 60,
      }),
    });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && data.data?.height === 178 && data.data?.dailyRepTarget === 60,
      '6. PUT /users/me/profile',
      `Height: ${data.data?.height}cm, Target: ${data.data?.dailyRepTarget} reps`
    );
  } catch (err: any) {
    assert(false, '6. PUT /users/me/profile', err.message);
  }

  // Test 7: Update Settings
  try {
    const res = await fetch(`${BASE_URL}/users/me/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        soundVolume: 90,
        poseStrictness: 'strict',
        darkMode: true,
      }),
    });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && data.data?.soundVolume === 90 && data.data?.poseStrictness === 'strict',
      '7. PUT /users/me/settings',
      `Volume: ${data.data?.soundVolume}%, Strictness: ${data.data?.poseStrictness}`
    );
  } catch (err: any) {
    assert(false, '7. PUT /users/me/settings', err.message);
  }

  // Test 8: Upload Avatar URL
  try {
    const res = await fetch(`${BASE_URL}/users/me/avatar`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      }),
    });
    const data = (await res.json()) as any;
    assert(res.status === 200 && data.success && !!data.data?.avatarUrl, '8. POST /users/me/avatar', 'Avatar updated');
  } catch (err: any) {
    assert(false, '8. POST /users/me/avatar', err.message);
  }

  // Test 9: Create Workout Session (Squat)
  let createdSessionId = '';
  try {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        exercise: 'squat',
        exerciseIcon: '🦵',
        reps: 20,
        targetReps: 20,
        duration: 150,
        formScore: 94.5,
        goodReps: 19,
        badReps: 1,
        calories: 52.8,
        statusBadge: 'SEMPURNA',
        feedback: [
          { rep: 10, message: 'Pertahankan punggung tetap tegak', type: 'bad' },
          { rep: 20, message: 'Form repetisi penutup sangat prima!', type: 'good' },
        ],
      }),
    });
    const data = (await res.json()) as any;
    createdSessionId = data.data?.id;
    assert(
      res.status === 201 && data.success && !!createdSessionId,
      '9. POST /sessions',
      `Created ID: ${createdSessionId}`
    );
  } catch (err: any) {
    assert(false, '9. POST /sessions', err.message);
  }

  // Create second session (Push-up) for analytics testing
  try {
    await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        exercise: 'pushup',
        exerciseIcon: '💪',
        reps: 15,
        targetReps: 15,
        duration: 90,
        formScore: 86.0,
        goodReps: 13,
        badReps: 2,
        calories: 35.0,
        statusBadge: 'PRESISI TINGGI',
        feedback: [],
      }),
    });
  } catch (err) {
    // Ignore error
  }

  // Test 10: List Workout Sessions
  try {
    const res = await fetch(`${BASE_URL}/sessions?limit=10&sort=date_desc`, { headers: authHeaders });
    const data = (await res.json()) as any;
    const count = data.data?.length || 0;
    assert(res.status === 200 && data.success && count >= 2, '10. GET /sessions', `Returned ${count} sessions`);
  } catch (err: any) {
    assert(false, '10. GET /sessions', err.message);
  }

  // Test 11: Get Session Detail By ID
  try {
    const res = await fetch(`${BASE_URL}/sessions/${createdSessionId}`, { headers: authHeaders });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && data.data?.id === createdSessionId && data.data?.feedback?.length === 2,
      '11. GET /sessions/:id',
      `Found session ${createdSessionId} with ${data.data?.feedback?.length} feedback items`
    );
  } catch (err: any) {
    assert(false, '11. GET /sessions/:id', err.message);
  }

  // Test 12: Progress Summary
  try {
    const res = await fetch(`${BASE_URL}/progress/summary`, { headers: authHeaders });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && data.data?.totalSessions >= 2 && data.data?.totalReps === 35,
      '12. GET /progress/summary',
      `Total Reps: ${data.data?.totalReps}, Avg Score: ${data.data?.averageFormScore}%`
    );
  } catch (err: any) {
    assert(false, '12. GET /progress/summary', err.message);
  }

  // Test 13: Progress Weekly Chart
  try {
    const res = await fetch(`${BASE_URL}/progress/weekly`, { headers: authHeaders });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && Array.isArray(data.data?.labels) && data.data.labels.length === 7,
      '13. GET /progress/weekly',
      `7-Day data points loaded`
    );
  } catch (err: any) {
    assert(false, '13. GET /progress/weekly', err.message);
  }

  // Test 14: Progress Monthly Chart
  try {
    const res = await fetch(`${BASE_URL}/progress/monthly`, { headers: authHeaders });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && Array.isArray(data.data?.labels) && data.data.labels.length === 30,
      '14. GET /progress/monthly',
      `30-Day data points loaded`
    );
  } catch (err: any) {
    assert(false, '14. GET /progress/monthly', err.message);
  }

  // Test 15: Progress Streak
  try {
    const res = await fetch(`${BASE_URL}/progress/streak`, { headers: authHeaders });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && typeof data.data?.currentStreak === 'number',
      '15. GET /progress/streak',
      `Current Streak: ${data.data?.currentStreak} days`
    );
  } catch (err: any) {
    assert(false, '15. GET /progress/streak', err.message);
  }

  // Test 16: Progress Best for Exercise
  try {
    const res = await fetch(`${BASE_URL}/progress/best/squat`, { headers: authHeaders });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && data.data?.bestReps === 20,
      '16. GET /progress/best/:exercise',
      `Best Squat Reps: ${data.data?.bestReps}, Form: ${data.data?.bestFormScore}%`
    );
  } catch (err: any) {
    assert(false, '16. GET /progress/best/:exercise', err.message);
  }

  // Test 17: Progress By Exercise Breakdown
  try {
    const res = await fetch(`${BASE_URL}/progress/by-exercise`, { headers: authHeaders });
    const data = (await res.json()) as any;
    assert(
      res.status === 200 && data.success && Array.isArray(data.data) && data.data.length >= 2,
      '17. GET /progress/by-exercise',
      `Breakdown contains ${data.data?.length} exercises`
    );
  } catch (err: any) {
    assert(false, '17. GET /progress/by-exercise', err.message);
  }

  // Test 18: Delete Session
  try {
    const res = await fetch(`${BASE_URL}/sessions/${createdSessionId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const data = (await res.json()) as any;
    assert(res.status === 200 && data.success, '18. DELETE /sessions/:id', `Deleted session ${createdSessionId}`);
  } catch (err: any) {
    assert(false, '18. DELETE /sessions/:id', err.message);
  }

  // Test 19: Auth Logout
  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: authHeaders,
    });
    const data = (await res.json()) as any;
    assert(res.status === 200 && data.success, '19. POST /auth/logout', 'Session cleared successfully');
  } catch (err: any) {
    assert(false, '19. POST /auth/logout', err.message);
  }

  console.log('\n====================================================');
  console.log(`🏁 Test Results: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});

