/**
 * @fileoverview Tests for memory routes — user profile and session history.
 */

const request = require('supertest');
const app = require('../src/app');

const AUTH_HEADER = 'Bearer valid-test-token';

describe('Memory Routes', () => {
  describe('GET /api/memory/profile', () => {
    it('should return user profile and sessions', async () => {
      const res = await request(app)
        .get('/api/memory/profile')
        .set('Authorization', AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('profile');
      expect(res.body).toHaveProperty('memorySummary');
      expect(res.body).toHaveProperty('sessions');
    });
  });

  describe('PUT /api/memory/profile', () => {
    it('should update user profile fields', async () => {
      const res = await request(app)
        .put('/api/memory/profile')
        .set('Authorization', AUTH_HEADER)
        .send({ targetRole: 'Software Engineer', expertiseLevel: 'intermediate' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Profile updated.');
      expect(res.body.updates).toHaveProperty('targetRole', 'Software Engineer');
    });

    it('should reject invalid expertiseLevel', async () => {
      const res = await request(app)
        .put('/api/memory/profile')
        .set('Authorization', AUTH_HEADER)
        .send({ expertiseLevel: 'wizard' });

      // No valid fields — returns 400
      expect(res.status).toBe(400);
    });

    it('should return 400 with no valid fields', async () => {
      const res = await request(app)
        .put('/api/memory/profile')
        .set('Authorization', AUTH_HEADER)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'BadRequest');
    });
  });

  describe('GET /api/memory/sessions', () => {
    it('should return session list', async () => {
      const res = await request(app)
        .get('/api/memory/sessions')
        .set('Authorization', AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sessions');
      expect(Array.isArray(res.body.sessions)).toBe(true);
    });
  });
});
