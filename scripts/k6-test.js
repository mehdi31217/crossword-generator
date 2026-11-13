// Crossword k6 Load Test
// Usage: k6 run scripts/k6-test.js --vus 50 --duration 30s

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = 'http://localhost:8081/api';

// Custom metrics
const failRate = new Rate('request_failures');
const latencyTrend = new Trend('request_duration_ms');
const reqCount = new Counter('total_requests');

const CATEGORIES = ['general', 'food', 'movies', 'cities', 'knowledge', 'body', 'jobs', 'tech', 'nature', 'shahnameh'];

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Ramp up to 10 users
    { duration: '10s', target: 30 },   // Ramp to 30
    { duration: '10s', target: 50 },   // Ramp to 50
    { duration: '20s', target: 50 },   // Stay at 50
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% requests < 2s
    request_failures: ['rate<0.05'],    // Failure rate < 5%
  },
};

// Generate a unique user ID for this VU
function getUserId(vu) {
  return `k6_user_${__VU}_${vu || 0}`;
}

export default function () {
  group('Health Check', function () {
    const res = http.get(`${BASE_URL}/health`);
    check(res, { 'health ok': (r) => r.status === 200 });
    latencyTrend.add(res.timings.duration);
    failRate.add(res.status !== 200);
    reqCount.add(1);
    sleep(0.5);
  });

  group('Login', function () {
    const deviceId = getUserId(Date.now());
    const payload = JSON.stringify({
      deviceId,
      username: `کاربر_k6_${__VU}`,
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/login`, payload, params);
    check(res, { 'login ok': (r) => r.status === 200 });
    latencyTrend.add(res.timings.duration);
    failRate.add(res.status !== 200);
    reqCount.add(1);
    sleep(0.3);
  });

  group('Leaderboard', function () {
    const res = http.get(`${BASE_URL}/leaderboard`);
    check(res, { 'leaderboard ok': (r) => r.status === 200 });
    latencyTrend.add(res.timings.duration);
    failRate.add(res.status !== 200);
    reqCount.add(1);
    sleep(0.3);
  });

  group('Dictionary Stats', function () {
    const res = http.get(`${BASE_URL}/dictionary/stats`);
    check(res, { 'dict stats ok': (r) => r.status === 200 });
    latencyTrend.add(res.timings.duration);
    failRate.add(res.status !== 200);
    reqCount.add(1);
    sleep(0.3);
  });

  group('Story Books', function () {
    const res = http.get(`${BASE_URL}/story/books`);
    check(res, { 'story books ok': (r) => r.status === 200 });
    latencyTrend.add(res.timings.duration);
    failRate.add(res.status !== 200);
    reqCount.add(1);
    sleep(0.3);
  });

  group('Dictionary Query', function () {
    for (let i = 0; i < 3; i++) {
      const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const res = http.get(`${BASE_URL}/dictionary?category=${cat}&language=fa&limit=10`);
      check(res, { 'dict query ok': (r) => r.status === 200 });
      latencyTrend.add(res.timings.duration);
      failRate.add(res.status !== 200);
      reqCount.add(1);
      sleep(0.2);
    }
  });

  group('Save Match', function () {
    const payload = JSON.stringify({
      deviceId: getUserId(__VU),
      score: Math.floor(Math.random() * 10000),
      time_taken: Math.floor(Math.random() * 300) + 30,
      grid_size: Math.floor(Math.random() * 6) + 5,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/match`, payload, params);
    check(res, { 'save match ok': (r) => r.status === 200 });
    latencyTrend.add(res.timings.duration);
    failRate.add(res.status !== 200);
    reqCount.add(1);
    sleep(0.5);
  });
}
