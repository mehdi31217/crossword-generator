// ===== Crossword Load Test =====
// Usage: node scripts/load-test.mjs [options]
// Options:
//   --users=N     Number of concurrent simulated users (default: 50)
//   --duration=N  Test duration in seconds (default: 30)
//   --ramp=N      Ramp-up time in seconds (default: 5)
//   --api=N       API port (default: 8081)
//   --ws          Include WebSocket load testing
//   --battle      Include full battle flow simulation
//   --silent      Minimal output (summary only)

import http from 'http';
import { WebSocket } from 'ws';
import crypto from 'crypto';

// ===== Config =====
const API_PORT = parseInt(process.argv.find(a => a.startsWith('--api='))?.split('=')[1] || '8081');
const CONCURRENT_USERS = parseInt(process.argv.find(a => a.startsWith('--users='))?.split('=')[1] || '50');
const DURATION_SEC = parseInt(process.argv.find(a => a.startsWith('--duration='))?.split('=')[1] || '30');
const RAMP_SEC = parseInt(process.argv.find(a => a.startsWith('--ramp='))?.split('=')[1] || '5');
const TEST_WS = process.argv.includes('--ws');
const TEST_BATTLE = process.argv.includes('--battle');
const SILENT = process.argv.includes('--silent');

const API_BASE = `http://localhost:${API_PORT}`;
const WS_URL = `ws://localhost:${API_PORT}`;

// Helper: prefix paths with /api
const api = (path) => `/api${path.startsWith('/') ? path : '/' + path}`;
const CATEGORIES = ['general', 'food', 'movies', 'cities', 'knowledge', 'body', 'jobs', 'tech', 'nature', 'shahnameh'];

// ===== Stats =====
const stats = {
  requests: 0,
  success: 0,
  failures: 0,
  totalLatency: 0,
  minLatency: Infinity,
  maxLatency: 0,
  wsConnections: 0,
  wsDisconnections: 0,
  wsErrors: 0,
  endpointLatency: {},
};

function recordStats(endpoint, latency, success) {
  stats.requests++;
  stats.totalLatency += latency;
  stats.minLatency = Math.min(stats.minLatency, latency);
  stats.maxLatency = Math.max(stats.maxLatency, latency);
  if (success) stats.success++;
  else stats.failures++;
  if (!stats.endpointLatency[endpoint]) stats.endpointLatency[endpoint] = { count: 0, total: 0, min: Infinity, max: 0, failures: 0 };
  const e = stats.endpointLatency[endpoint];
  e.count++;
  e.total += latency;
  e.min = Math.min(e.min, latency);
  e.max = Math.max(e.max, latency);
  if (!success) e.failures++;
}

function makeUser(id) {
  const deviceId = `test_user_${id}`;
  const phoneId = `test_${String(id).padStart(10, '0')}`;
  return {
    id,
    deviceId,
    phoneId,
    username: `کاربر_تست_${id}`,
    avatar: ['🦁', '🐉', '🦅', '🐴', '🐪', '🦌', '🐎', '🐫'][id % 8],
  };
}

// ===== HTTP Request Helper =====
function httpRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const start = Date.now();
    const url = new URL(path, API_BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const latency = Date.now() - start;
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = null; }
        const ok = res.statusCode >= 200 && res.statusCode < 500;
        recordStats(path, latency, ok);
        resolve({ status: res.statusCode, data: parsed, latency });
      });
    });
    req.on('error', (err) => {
      const latency = Date.now() - start;
      recordStats(path, latency, false);
      resolve({ status: 0, error: err.message, latency });
    });
    req.on('timeout', () => {
      req.destroy();
      recordStats(path, Date.now() - start, false);
      resolve({ status: 0, error: 'timeout', latency: Date.now() - start });
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ===== Phase 1: REST API Baseline =====
async function baselineTest() {
  if (!SILENT) console.log('\n📊 Phase 1: REST API Baseline');
  const results = [];

  // Health check
  results.push(await httpRequest('GET', api('/health')));

  // Login a few users
  for (let i = 0; i < 5; i++) {
    const user = makeUser(i);
    results.push(await httpRequest('POST', api('/login'), {
      deviceId: user.deviceId,
      username: user.username,
    }));
  }

  // Dictionary stats
  results.push(await httpRequest('GET', api('/dictionary/stats')));

  // Leaderboard
  results.push(await httpRequest('GET', api('/leaderboard')));

  // Story books
  results.push(await httpRequest('GET', api('/story/books')));

  // Dictionary by categories
  for (const cat of CATEGORIES.slice(0, 3)) {
    results.push(await httpRequest('GET', api(`/dictionary?category=${cat}&language=fa&limit=20`)));
  }

  const successCount = results.filter(r => r.status >= 200 && r.status < 400).length;
  if (!SILENT) console.log(`   ${successCount}/${results.length} requests succeeded`);
  return results;
}

// ===== Phase 2: Concurrent User Simulation =====
async function concurrentTest() {
  if (!SILENT) console.log(`\n👥 Phase 2: Concurrent Users (${CONCURRENT_USERS} users, ${DURATION_SEC}s)`);
  const endTime = Date.now() + DURATION_SEC * 1000;
  let activeUsers = 0;
  let completedUsers = 0;
  const results = [];

  const userActions = [
    () => httpRequest('GET', api('/health')),
    () => httpRequest('GET', api('/leaderboard')),
    () => httpRequest('GET', api('/dictionary/stats')),
    () => httpRequest('GET', api('/story/books')),
    () => httpRequest('GET', api(`/dictionary?category=${CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]}&language=fa&limit=5`)),
  ];

  // Create users gradually over ramp-up period
  const usersPerBatch = Math.max(1, Math.floor(CONCURRENT_USERS / (RAMP_SEC * 4)));
  let userIdx = 0;
  const userPromises = [];

  while (Date.now() < endTime) {
    // Spawn new users during ramp-up
    if (userIdx < CONCURRENT_USERS) {
      const batchSize = Math.min(usersPerBatch, CONCURRENT_USERS - userIdx);
      for (let i = 0; i < batchSize; i++) {
        const uid = userIdx++;
        activeUsers++;
        const user = makeUser(uid);
        const promise = (async () => {
          try {
            // Login first
            const loginResult = await httpRequest('POST', api('/login'), {
              deviceId: user.deviceId,
              username: user.username,
            });
            results.push(loginResult);

            // Then do random actions until time expires
            while (Date.now() < endTime) {
              const action = userActions[Math.floor(Math.random() * userActions.length)];
              const result = await action();
              results.push(result);
              // Random think time 50-200ms
              await new Promise(r => setTimeout(r, 50 + Math.random() * 150));
            }
          } catch (err) {
            if (!SILENT) console.error(`   User ${uid} error:`, err.message);
          } finally {
            activeUsers--;
            completedUsers++;
          }
        })();
        userPromises.push(promise);
      }
    }

    if (!SILENT) {
      const elapsed = ((Date.now() - (endTime - DURATION_SEC * 1000)) / 1000).toFixed(1);
      process.stdout.write(`\r   Active: ${activeUsers} | Completed: ${completedUsers} | Time: ${elapsed}s | Req: ${stats.requests}`);
    }
    await new Promise(r => setTimeout(r, 250));
  }

  // Wait for all users to finish
  await Promise.allSettled(userPromises);
  return results;
}

// ===== Phase 3: WebSocket Stress Test =====
async function wsStressTest() {
  if (!TEST_WS) return [];
  if (!SILENT) console.log(`\n🔌 Phase 3: WebSocket Stress Test (${Math.min(CONCURRENT_USERS, 100)} connections)`);
  const connections = [];
  const errors = [];
  const maxConns = Math.min(CONCURRENT_USERS, 100);

  return new Promise((resolve) => {
    let connected = 0;
    let reported = 0;

    for (let i = 0; i < maxConns; i++) {
      const user = makeUser(i);
      const start = Date.now();
      let ws;
      try {
        ws = new WebSocket(WS_URL);
      } catch (err) {
        errors.push({ user: i, error: err.message });
        connected++;
        if (++reported === maxConns) resolve({ connections, errors });
        continue;
      }

      ws.on('open', () => {
        stats.wsConnections++;
        const latency = Date.now() - start;
        connections.push({ userId: i, latency, status: 'connected' });

        // Join global_social channel
        ws.send(JSON.stringify({
          type: 'channel:join',
          channel: 'global_social',
          data: { id: user.deviceId, name: user.username, avatar: user.avatar },
        }));

        // Send a few ping/pong
        let pings = 0;
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            pings++;
            ws.send(JSON.stringify({ type: 'ping' }));
            if (pings >= 3) {
              clearInterval(pingInterval);
              // Leave and close
              ws.send(JSON.stringify({
                type: 'channel:leave',
                channel: 'global_social',
              }));
              ws.close();
            }
          } else {
            clearInterval(pingInterval);
          }
        }, 1000);
      });

      ws.on('error', (err) => {
        stats.wsErrors++;
        errors.push({ user: i, error: err.message });
      });

      ws.on('close', () => {
        stats.wsDisconnections++;
        connected++;
        if (++reported === maxConns) resolve({ connections, errors });
      });

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'pong') {
            // heartbeat response
          }
        } catch { /* ignore parse errors */ }
      });
    }

    // Timeout fallback
    setTimeout(() => {
      resolve({ connections, errors });
    }, 15000);
  });
}

// ===== Phase 4: Battle Flow Simulation =====
async function battleFlowTest() {
  if (!TEST_BATTLE) return [];
  if (!SILENT) console.log(`\n⚔️ Phase 4: Battle Flow Simulation (${Math.min(Math.floor(CONCURRENT_USERS / 10), 5)} pairs)`);
  const numPairs = Math.min(Math.floor(CONCURRENT_USERS / 10), 5);
  const results = [];

  for (let p = 0; p < numPairs; p++) {
    const host = makeUser(p * 2);
    const joiner = makeUser(p * 2 + 1);
    const pairStart = Date.now();

    // 1. Login both
    await httpRequest('POST', api('/login'), { deviceId: host.deviceId, username: host.username });
    await httpRequest('POST', api('/login'), { deviceId: joiner.deviceId, username: joiner.username });

    // 2. Create room (simulated via HTTP - the real flow uses WS)
    const roomId = String(100000 + Math.floor(Math.random() * 900000));

    // 3. Connect host to room via WS
    const hostWS = new WebSocket(WS_URL);
    await new Promise(r => hostWS.on('open', r));

    hostWS.send(JSON.stringify({
      type: 'channel:join',
      channel: `room_${roomId}`,
      data: { id: host.deviceId, name: host.username, avatar: host.avatar },
    }));
    await new Promise(r => setTimeout(r, 200));

    // 4. Connect joiner to room via WS
    const joinerWS = new WebSocket(WS_URL);
    await new Promise(r => joinerWS.on('open', r));

    joinerWS.send(JSON.stringify({
      type: 'channel:join',
      channel: `room_${roomId}`,
      data: { id: joiner.deviceId, name: joiner.username, avatar: joiner.avatar },
    }));
    await new Promise(r => setTimeout(r, 200));

    // 5. Host sends preference
    hostWS.send(JSON.stringify({
      type: 'channel:broadcast',
      channel: `room_${roomId}`,
      event: 'player_preference',
      payload: {
        playerId: host.deviceId,
        playerName: host.username,
        playerAvatar: host.avatar,
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        size: 7 + Math.floor(Math.random() * 4),
      },
      senderId: host.deviceId,
    }));
    await new Promise(r => setTimeout(r, 100));

    // 6. Joiner sends preference
    joinerWS.send(JSON.stringify({
      type: 'channel:broadcast',
      channel: `room_${roomId}`,
      event: 'player_preference',
      payload: {
        playerId: joiner.deviceId,
        playerName: joiner.username,
        playerAvatar: joiner.avatar,
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        size: 7 + Math.floor(Math.random() * 4),
      },
      senderId: joiner.deviceId,
    }));
    await new Promise(r => setTimeout(r, 100));

    // 7. Host sends coin_flip_result
    hostWS.send(JSON.stringify({
      type: 'channel:broadcast',
      channel: `room_${roomId}`,
      event: 'coin_flip_result',
      payload: {
        selectedCategory: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        selectedSize: 8,
      },
      senderId: host.deviceId,
    }));
    await new Promise(r => setTimeout(r, 100));

    // 8. Joiner sends merge_ack
    joinerWS.send(JSON.stringify({
      type: 'channel:broadcast',
      channel: `room_${roomId}`,
      event: 'merge_ack',
      payload: { playerId: joiner.deviceId },
      senderId: joiner.deviceId,
    }));
    await new Promise(r => setTimeout(r, 100));

    // 9. Cleanup
    hostWS.send(JSON.stringify({ type: 'channel:leave', channel: `room_${roomId}` }));
    joinerWS.send(JSON.stringify({ type: 'channel:leave', channel: `room_${roomId}` }));
    hostWS.close();
    joinerWS.close();

    const latency = Date.now() - pairStart;
    results.push({ pair: p, host: host.deviceId, joiner: joiner.deviceId, roomId, latency });
    if (!SILENT) console.log(`   Pair ${p + 1}/${numPairs}: ${latency}ms`);
  }

  return results;
}

// ===== Summary =====
function printSummary(startTime) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgLatency = stats.requests > 0 ? (stats.totalLatency / stats.requests).toFixed(1) : 'N/A';
  const throughput = stats.requests / parseFloat(elapsed);

  console.log('\n' + '='.repeat(60));
  console.log('📈 LOAD TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Duration:          ${elapsed}s`);
  console.log(`   Target Users:      ${CONCURRENT_USERS}`);
  console.log(`   Total Requests:    ${stats.requests}`);
  console.log(`   Successful:        ${stats.success} (${(stats.success / stats.requests * 100).toFixed(1)}%)`);
  console.log(`   Failures:          ${stats.failures} (${(stats.failures / stats.requests * 100).toFixed(1)}%)`);
  console.log(`   Avg Latency:       ${avgLatency}ms`);
  console.log(`   Min Latency:       ${stats.minLatency === Infinity ? 'N/A' : stats.minLatency}ms`);
  console.log(`   Max Latency:       ${stats.maxLatency}ms`);
  console.log(`   Throughput:        ${throughput.toFixed(1)} req/s`);

  if (TEST_WS) {
    console.log(`\n   WS Connections:     ${stats.wsConnections}`);
    console.log(`   WS Disconnections:  ${stats.wsDisconnections}`);
    console.log(`   WS Errors:          ${stats.wsErrors}`);
  }

  // Per-endpoint breakdown
  console.log('\n   ─── Per-Endpoint Breakdown ───');
  const endpoints = Object.entries(stats.endpointLatency).sort((a, b) => b[1].count - a[1].count);
  for (const [ep, data] of endpoints.slice(0, 15)) {
    const avg = (data.total / data.count).toFixed(1);
    const failPct = ((data.failures / data.count) * 100).toFixed(1);
    console.log(`   ${ep.padEnd(40)} ${String(data.count).padStart(6)} req  ${avg.padStart(7)}ms avg  ${failPct}% fail`);
  }
  if (endpoints.length > 15) console.log(`   ... and ${endpoints.length - 15} more endpoints`);

  console.log('='.repeat(60));
}

// ===== Main =====
async function main() {
  if (!SILENT) {
    console.log('🚀 Crossword Load Test');
    console.log(`   Server:  http://localhost:${API_PORT}`);
    console.log(`   Users:   ${CONCURRENT_USERS}`);
    console.log(`   Duration: ${DURATION_SEC}s`);
    console.log(`   Ramp-up: ${RAMP_SEC}s`);
    console.log(`   WS:      ${TEST_WS ? 'yes' : 'no'}`);
    console.log(`   Battle:  ${TEST_BATTLE ? 'yes' : 'no'}`);
  }

  const startTime = Date.now();

  try {
    await baselineTest();
    if (!SILENT) console.log('   ✓ Baseline complete');
  } catch (err) {
    console.error('   ✗ Baseline failed:', err.message);
  }

  try {
    await concurrentTest();
    if (!SILENT) console.log('\n   ✓ Concurrent test complete');
  } catch (err) {
    console.error('\n   ✗ Concurrent test failed:', err.message);
  }

  if (TEST_WS) {
    try {
      await wsStressTest();
      if (!SILENT) console.log('   ✓ WS stress test complete');
    } catch (err) {
      console.error('   ✗ WS stress test failed:', err.message);
    }
  }

  if (TEST_BATTLE) {
    try {
      await battleFlowTest();
      if (!SILENT) console.log('   ✓ Battle flow test complete');
    } catch (err) {
      console.error('   ✗ Battle flow test failed:', err.message);
    }
  }

  printSummary(startTime);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
