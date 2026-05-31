import { Router } from 'express';
import { fund, transfer, withdraw, balance } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/fund', fund);
router.post('/transfer', transfer);
router.post('/withdraw', withdraw);
router.get('/balance', balance);

export default router;