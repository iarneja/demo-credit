import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Demo Credit API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

export default app;