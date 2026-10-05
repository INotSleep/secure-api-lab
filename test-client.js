const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

const userCredentials = { 'X-Login': 'user1', 'X-Password': 'password123' };
const adminCredentials = { 'X-Login': 'admin1', 'X-Password': 'password123' };

let failed = 0;

const request = async (name, expected, method, path, headers = {}, body) => {
  console.log(`\n[${name}] ${method} ${path}`);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    const ok = response.status === expected;

    if (!ok) failed++;
    console.log(`Status: ${response.status} (expected ${expected}) ${ok ? 'OK' : 'FAIL'}`);
    console.log('Data:', data);
    return data;
  } catch (error) {
    failed++;
    console.error('Error:', error.message);
    return null;
  }
};

const runTests = async () => {
  console.log('--- Running API Tests ---');

  await request('TEST 1', 401, 'GET', '/documents');
  await request('TEST 2', 200, 'GET', '/documents', userCredentials);
  await request('TEST 3', 403, 'GET', '/employees', userCredentials);
  await request('TEST 4', 200, 'GET', '/employees', adminCredentials);

  const created = await request('TEST 5', 201, 'POST', '/documents', userCredentials, {
    title: 'Test Doc',
    content: 'Created by test-client.js',
  });
  await request('TEST 6', 400, 'POST', '/documents', userCredentials, { content: 'No title' });

  if (created) {
    await request('TEST 7', 204, 'DELETE', `/documents/${created.id}`, adminCredentials);
    await request('TEST 8', 404, 'DELETE', `/documents/${created.id}`, adminCredentials);
  }
  await request('TEST 9', 404, 'GET', '/non-existent', adminCredentials);

  console.log(`\n--- Tests finished: ${failed ? `${failed} failed` : 'all passed'} ---`);
  if (failed) process.exitCode = 1;
};

runTests();
