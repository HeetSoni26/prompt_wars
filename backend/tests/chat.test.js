/**
 * @fileoverview Tests for chat routes — session creation and message streaming.
 */

const request = require('supertest');
const app = require('../src/app');

const AUTH_HEADER = 'Bearer valid-test-token';

describe('Chat Routes', () => {
  describe('POST /api/chat/session', () => {
    it('should create a new chat session', async () => {
      const res = await request(app)
        .post('/api/chat/session')
        .set('Authorization', AUTH_HEADER)
        .send({ title: 'Interview Prep' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('sessionId');
      expect(res.body).toHaveProperty('title', 'Interview Prep');
    });

    it('should use default title if none provided', async () => {
      const res = await request(app)
        .post('/api/chat/session')
        .set('Authorization', AUTH_HEADER)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New Career Session');
    });
  });

  describe('POST /api/chat/message', () => {
    it('should return 400 if sessionId is missing', async () => {
      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', AUTH_HEADER)
        .send({ message: 'Help me with my resume' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'BadRequest');
    });

    it('should return 400 if message is missing', async () => {
      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', AUTH_HEADER)
        .send({ sessionId: 'some-session-id' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'BadRequest');
    });

    it('should sanitize and reject empty message after stripping HTML', async () => {
      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', AUTH_HEADER)
        .send({ sessionId: 'session-1', message: '<script></script>' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/chat/session/:sessionId/messages', () => {
    it('should return message history for a session', async () => {
      const res = await request(app)
        .get('/api/chat/session/test-session-id/messages')
        .set('Authorization', AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('messages');
      expect(Array.isArray(res.body.messages)).toBe(true);
    });
  });
});
