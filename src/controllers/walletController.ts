import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { fundWallet, transferFunds, withdrawFunds, getBalance } from '../services/walletService';

export const fund = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount) { res.status(400).json({ message: 'Amount is required' }); return; }
    const wallet = await fundWallet(req.user!.id, Number(amount));
    res.status(200).json({ message: 'Wallet funded successfully', wallet });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const transfer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverEmail, amount } = req.body;
    if (!receiverEmail || !amount) { res.status(400).json({ message: 'receiverEmail and amount are required' }); return; }
    const wallet = await transferFunds(req.user!.id, receiverEmail, Number(amount));
    res.status(200).json({ message: 'Transfer successful', wallet });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const withdraw = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount) { res.status(400).json({ message: 'Amount is required' }); return; }
    const wallet = await withdrawFunds(req.user!.id, Number(amount));
    res.status(200).json({ message: 'Withdrawal successful', wallet });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const balance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wallet = await getBalance(req.user!.id);
    res.status(200).json({ message: 'Balance fetched', wallet });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};