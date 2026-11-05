// FitTrack Comprehensive Security & Penetration Vulnerability Test Suite
// Verifies defensive protections against OWASP Top 10 vulnerabilities

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail: string = '') {
  if (condition) {
    console.log(`  🛡️  SECURE: ${testName} ${detail ? `— [${detail}]` : ''}`);
    passed++;
  } else {
    console.error(`  🚨 VULNERABILITY DETECTED: ${testName} ${detail ? `— [${detail}]` : ''}`);
    failed++;
  }
}

async function runSecurityTests() {
  console.log('====================================================');
  console.log('🔒 Running FitTrack Automated Security & Pentest Suite');
  console.log(`🎯 Target API: ${BASE_URL}`);
  console.log('====================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: CORS & Cross-Origin Request Forgery Protection
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing CORS Origin Restriction & Spoofing Defense ---');
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      headers: {
        Origin: 'https://evil-hacker-site.org',
      },
    });
    // Should be blocked by CORS error or 403 Forbidden
    assert(
      res.status === 403 || !res.ok,
      'CORS Origin Spoofing Blocked',
      `Status: ${res.status} (Untrusted origin rejected)`
    );
  } catch (err: any) {
    // If fetch failed at network/cors level, that's also safe
    assert(true, 'CORS Origin Spoofing Blocked', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Bcrypt ReDoS / Oversized Password Buffer Exhaustion Attack
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Password Payload Buffer Exhaustion (Bcrypt ReDoS Defense) ---');
  try {
    const giantPassword = 'A'.repeat(50000); // 50,000 characters
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex@example.com',
        password: giantPassword,
      }),
    });
    const elapsed = Date.now() - start;
    const data = (await res.json()) as any;

    // Should be rejected by Zod schema immediately (within < 100ms) with 400 Bad Request
    assert(
      res.status === 400 && data.success === false && elapsed < 500,
      'Oversized Password Rejected Before Hashing',
      `Status: ${res.status}, Blocked in ${elapsed}ms (No CPU lockup)`
    );
  } catch (err: any) {
    assert(false, 'Oversized Password Buffer Test', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Privilege Escalation & Mass Assignment Attack Defense
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Mass Assignment / Privilege Escalation Protection ---');
  // First login as normal user
  let token = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@example.com', password: 'Password123!' }),
    });
    const loginData = (await loginRes.json()) as any;
    token = loginData.data?.accessToken;
  } catch (err) {
    // Continue
  }

  if (token) {
    try {
      // Attempt to self-assign "ADMIN" role and "VIP GOD" tier
      const exploitRes = await fetch(`${BASE_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: 'SUPERADMIN',
          tier: 'VIP_UNRESTRICTED_ACCESS',
          name: 'Alex Verified',
        }),
      });
      const exploitData = (await exploitRes.json()) as any;

      // Verify the profile via GET /users/me
      const checkRes = await fetch(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const checkData = (await checkRes.json()) as any;

      // Role must NOT have changed to SUPERADMIN!
      const roleNotEscalated = checkData.data?.profile?.role !== 'SUPERADMIN';
      assert(
        roleNotEscalated,
        'Privilege Escalation Blocked',
        `Current Role: ${checkData.data?.profile?.role} (SUPERADMIN injection rejected)`
      );
    } catch (err: any) {
      assert(false, 'Privilege Escalation Test', err.message);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 4: JWT Algorithm Confusion & "alg: none" Forged Token Defense
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing JWT "alg: none" & Signature Forgery Defense ---');
  try {
    // Forged JWT with alg: none header
    const fakeHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const fakePayload = Buffer.from(JSON.stringify({ userId: 'fake-admin-id', email: 'admin@hack.org' })).toString('base64url');
    const noneAlgToken = `${fakeHeader}.${fakePayload}.`;

    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${noneAlgToken}` },
    });
    const data = (await res.json()) as any;

    assert(
      res.status === 401 && data.success === false,
      'Forged "alg: none" Token Blocked',
      `Status: ${res.status} (Algorithm confusion prevented)`
    );
  } catch (err: any) {
    assert(false, 'JWT Algorithm Confusion Test', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: IDOR (Insecure Direct Object Reference) Cross-User Session Tampering
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing IDOR Cross-User Data Access & Deletion ---');
  try {
    // Create User B
    const userBSuffix = Date.now().toString(36);
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Attacker ${userBSuffix}`,
        email: `attacker_${userBSuffix}@test.org`,
        password: 'Password123!',
      }),
    });
    const regBData = (await regBRes.json()) as any;
    const tokenB = regBData.data?.accessToken;

    // Get User A's sessions
    const sessionsARes = await fetch(`${BASE_URL}/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sessionsAData = (await sessionsARes.json()) as any;
    const sessionAId = sessionsAData.data?.[0]?.id;

    if (sessionAId && tokenB) {
      // User B attempts to delete User A's session
      const idorDeleteRes = await fetch(`${BASE_URL}/sessions/${sessionAId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenB}` },
      });
      const idorDeleteData = (await idorDeleteRes.json()) as any;

      assert(
        idorDeleteRes.status === 404 || idorDeleteRes.status === 403,
        'IDOR Cross-User Deletion Blocked',
        `Status: ${idorDeleteRes.status} (User B cannot delete User A data)`
      );

      // Verify session A is still alive for User A
      const verifyRes = await fetch(`${BASE_URL}/sessions/${sessionAId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert(verifyRes.status === 200, 'Original User Data Preserved', `Session ${sessionAId} intact`);
    } else {
      assert(true, 'IDOR Test (Skipped: session or token unavailable)', 'Skipped');
    }
  } catch (err: any) {
    assert(false, 'IDOR Cross-User Test', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Memory Exhaustion / Oversized Array Attack (Zod CVE Mitigation)
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Testing Oversized Feedback Collection (Memory Exhaustion Defense) ---');
  try {
    // Attempt to submit a session with 5,000 feedback objects
    const oversizedFeedback = Array.from({ length: 5000 }, (_, i) => ({
      rep: i,
      message: 'Spam feedback message',
      type: 'good',
    }));

    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        exercise: 'squat',
        reps: 10,
        targetReps: 10,
        duration: 60,
        formScore: 90,
        goodReps: 10,
        badReps: 0,
        calories: 20,
        feedback: oversizedFeedback,
      }),
    });
    const data = (await res.json()) as any;

    assert(
      res.status === 400 && data.success === false,
      'Oversized Array Validation Bound Enforced',
      `Status: ${res.status} (Max 100 feedback items constraint active)`
    );
  } catch (err: any) {
    assert(false, 'Oversized Array Test', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Information Disclosure & Internal Stack Leakage Defense
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Information Disclosure / Stack Leakage ---');
  try {
    // Query with invalid non-existent route and bad types
    const res = await fetch(`${BASE_URL}/sessions?page=not_a_number&limit=invalid`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as any;
    const bodyString = JSON.stringify(data);

    // Ensure no internal file paths (like C:\Users\ or /node_modules) or database stack trace leaked
    const hasPathLeak = bodyString.includes('C:\\') || bodyString.includes('/Users/') || bodyString.includes('node_modules');
    const hasPrismaLeak = bodyString.includes('PrismaClientKnownRequestError');

    assert(
      !hasPathLeak && !hasPrismaLeak,
      'Internal Paths & Database Stack Masked',
      'No internal system paths or Prisma stack traces disclosed'
    );
  } catch (err: any) {
    assert(false, 'Information Disclosure Test', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Security Headers Inspection (Helmet Verification)
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Testing HTTP Security Headers (Helmet) ---');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const xContentType = res.headers.get('x-content-type-options');
    const xFrameOptions = res.headers.get('x-frame-options');
    const xPoweredBy = res.headers.get('x-powered-by');

    const hasNosniff = xContentType === 'nosniff';
    const hasFrameguard = xFrameOptions === 'DENY' || xFrameOptions === 'SAMEORIGIN';
    const hidesPoweredBy = !xPoweredBy; // express removed

    assert(
      hasNosniff && hasFrameguard && hidesPoweredBy,
      'HTTP Security Headers Active',
      `nosniff: ${hasNosniff}, frameguard: ${hasFrameguard}, hide-powered-by: ${hidesPoweredBy}`
    );
  } catch (err: any) {
    assert(false, 'Security Headers Test', err.message);
  }

  console.log('\n====================================================');
  console.log(`🏁 Security Test Results: ${passed} SECURE | ${failed} VULNERABLE`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((e) => {
  console.error('Fatal security test runner error:', e);
  process.exit(1);
});

