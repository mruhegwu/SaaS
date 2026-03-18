import request from 'supertest';
import { createApp } from '../app';
import { Application } from 'express';

let app: Application;

beforeAll(async () => {
  app = await createApp();
});

describe('Health Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return 200 with health status', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });

  describe('GET /api/health/live', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/api/health/live').expect(200);
      expect(response.text).toBe('OK');
    });
  });
});
