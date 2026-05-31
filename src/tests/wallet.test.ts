import request from 'supertest';
import app from '../app';
import db from '../config/database';

let token: string;
let token2: string;
const email1 = `wallet1_${Date.now()}@mailinator.com`;
const email2 = `wallet2_${Date.now()}@mailinator.com`;

beforeAll(async () => {
  await db.migrate.latest();

  await request(app).post('/api/auth/register')
    .send({ name: 'Wallet User1', email: email1, password: 'password123' });
  const login1 = await request(app).post('/api/auth/login')
    .send({ email: email1, password: 'password123' });
  token = login1.body.token;

  await request(app).post('/api/auth/register')
    .send({ name: 'Wallet User2', email: email2, password: 'password123' });
  const login2 = await request(app).post('/api/auth/login')
    .send({ email: email2, password: 'password123' });
  token2 = login2.body.token;
});

afterAll(async () => {
  await db('transactions').del();
  await db('wallets').del();
  await db('users').del();
  await db.destroy();
});

describe('Wallet Endpoints', () => {
  it('should fund wallet', async () => {
    const res = await request(app)
      .post('/api/wallet/fund')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000 });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Wallet funded successfully');
    expect(Number(res.body.wallet.balance)).toBe(5000);
  });

  it('should not fund with invalid amount', async () => {
    const res = await request(app)
      .post('/api/wallet/fund')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: -100 });
    expect(res.status).toBe(400);
  });

  it('should transfer funds', async () => {
    const res = await request(app)
      .post('/api/wallet/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiverEmail: email2, amount: 1000 });
    expect(res.status).toBe(200);
    expect(Number(res.body.wallet.balance)).toBe(4000);
  });

  it('should not transfer with insufficient balance', async () => {
    const res = await request(app)
      .post('/api/wallet/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiverEmail: email2, amount: 999999 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Insufficient balance');
  });

  it('should withdraw funds', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 500 });
    expect(res.status).toBe(200);
    expect(Number(res.body.wallet.balance)).toBe(3500);
  });

  it('should not withdraw with insufficient balance', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 999999 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Insufficient balance');
  });

  it('should get balance', async () => {
    const res = await request(app)
      .get('/api/wallet/balance')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.wallet).toBeDefined();
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app)
      .get('/api/wallet/balance');
    expect(res.status).toBe(401);
  });
});