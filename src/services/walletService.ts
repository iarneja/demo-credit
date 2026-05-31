import db from '../config/database';

export const fundWallet = async (userId: string, amount: number) => {
  if (amount <= 0) throw new Error('Amount must be greater than 0');

  await db.transaction(async (trx) => {
    const wallet = await trx('wallets').where({ user_id: userId }).first();
    if (!wallet) throw new Error('Wallet not found');

    await trx('wallets')
      .where({ user_id: userId })
      .increment('balance', amount);

    await trx('transactions').insert({
      wallet_id: wallet.id,
      type: 'fund',
      amount,
      status: 'success',
    });
  });

  const updated = await db('wallets').where({ user_id: userId }).first();
  return updated;
};

export const transferFunds = async (senderId: string, receiverEmail: string, amount: number) => {
  if (amount <= 0) throw new Error('Amount must be greater than 0');

  await db.transaction(async (trx) => {
    // Get sender wallet
    const senderWallet = await trx('wallets').where({ user_id: senderId }).first();
    if (!senderWallet) throw new Error('Sender wallet not found');
    if (Number(senderWallet.balance) < amount) throw new Error('Insufficient balance');

    // Get receiver
    const receiver = await trx('users').where({ email: receiverEmail }).first();
    if (!receiver) throw new Error('Receiver not found');

    if (receiver.id === senderId) throw new Error('Cannot transfer to yourself');

    const receiverWallet = await trx('wallets').where({ user_id: receiver.id }).first();
    if (!receiverWallet) throw new Error('Receiver wallet not found');

    // Deduct from sender
    await trx('wallets').where({ user_id: senderId }).decrement('balance', amount);

    // Add to receiver
    await trx('wallets').where({ user_id: receiver.id }).increment('balance', amount);

    // Record transactions for both
    await trx('transactions').insert([
      {
        wallet_id: senderWallet.id,
        type: 'transfer',
        amount,
        related_wallet_id: receiverWallet.id,
        status: 'success',
      },
      {
        wallet_id: receiverWallet.id,
        type: 'fund',
        amount,
        related_wallet_id: senderWallet.id,
        status: 'success',
      },
    ]);
  });

  const updated = await db('wallets').where({ user_id: senderId }).first();
  return updated;
};

export const withdrawFunds = async (userId: string, amount: number) => {
  if (amount <= 0) throw new Error('Amount must be greater than 0');

  await db.transaction(async (trx) => {
    const wallet = await trx('wallets').where({ user_id: userId }).first();
    if (!wallet) throw new Error('Wallet not found');
    if (Number(wallet.balance) < amount) throw new Error('Insufficient balance');

    await trx('wallets').where({ user_id: userId }).decrement('balance', amount);

    await trx('transactions').insert({
      wallet_id: wallet.id,
      type: 'withdraw',
      amount,
      status: 'success',
    });
  });

  const updated = await db('wallets').where({ user_id: userId }).first();
  return updated;
};

export const getBalance = async (userId: string) => {
  const wallet = await db('wallets').where({ user_id: userId }).first();
  if (!wallet) throw new Error('Wallet not found');
  return wallet;
};