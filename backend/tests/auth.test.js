/**
 * @fileoverview Tests for auth middleware token verification.
 */

const request = require('supertest');
const app = require('../src/app');

describe('Auth Middleware', () => {
  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/memory/profile');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should return 401 when Authorization header is malformed', async () => {
    const res = await request(app)
      .get('/api/memory/profile')
      .set('Authorization', 'Token abc123');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should pass with a valid Bearer token (mocked Firebase)', async () => {
    const res = await request(app)
      .get('/api/memory/profile')
      .set('Authorization', 'Bearer valid-test-token');
    // Firebase mock returns valid decoded token — expect non-401
    expect(res.status).not.toBe(401);
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'NotFound');
  });

  it('should return 200 for health check without auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
  });
});
