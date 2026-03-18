import request from 'supertest';
import { createApp } from '../app';
import { Application } from 'express';

let app: Application;

beforeAll(async () => {
  app = await createApp();
});

describe('Auth Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/auth/register').send(testUser).expect(201);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          user: {
            email: testUser.email,
            name: testUser.name,
            role: 'user',
          },
        },
      });
    });

    it('should return 400 for invalid email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'not-an-email' })
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser).expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          accessToken: expect.any(String),
        },
      });
    });

    it('should return 401 for invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });
  });
});
