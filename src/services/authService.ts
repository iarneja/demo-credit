import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { checkKarmaBlacklist } from './karmaService';

export const registerUser = async (name: string, email: string, password: string) => {
  // 1. Check blacklist
  const isBlacklisted = await checkKarmaBlacklist(email);
  if (isBlacklisted) {
    throw new Error('User is blacklisted and cannot be onboarded');
  }

  // 2. Check if email already exists
  const existing = await db('users').where({ email }).first();
  if (existing) {
    throw new Error('Email already registered');
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create user + wallet in a transaction
  await db.transaction(async (trx) => {
    const [userId] = await trx('users').insert({
      name,
      email,
      password: hashedPassword,
    });

    await trx('wallets').insert({
      user_id: userId,
      balance: 0.00,
    });
  });

  // 5. Fetch created user
  const user = await db('users').where({ email }).first();
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await db('users').where({ email }).first();
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email } };
};