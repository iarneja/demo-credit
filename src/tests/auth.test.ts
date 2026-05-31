import request from 'supertest';
import app from '../app';
import db from '../config/database';

beforeAll(async () => {
  await db.migrate.latest();
});

afterAll(async () => {
  await db('transactions').del();
  await db('wallets').del();
  await db('users').del();
  await db.destroy();
});

describe('Auth Endpoints', () => {
  const testEmail = `testuser_${Date.now()}@mailinator.com`;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: testEmail, password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Account created successfully');
  });

  it('should not register duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: testEmail, password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already registered');
  });

  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail });
    expect(res.status).toBe(400);
  });
});