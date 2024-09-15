import { TransactionRetrievalOptions } from '@/server/schemas';
import { filterTransactionFields } from '@/utils/helpers';
import { getTransactionsByDate, getTransfers } from '.';

/**
 * Retrieves transactions using various options
 * @param retrievalOpts
 * @returns
 */
export const getTransactions = async (
  retrievalOpts: TransactionRetrievalOptions
) => {
  const { account, dateRange, transactionType, ...options } = retrievalOpts;
  if (transactionType === 'transactions') {
    const transactions = await getTransactionsByDate(
      dateRange,
      options,
      account === 'transactional'
        ? process.env.UP_TRANS_ACC
        : account === 'savings'
        ? process.env.UP_SAVINGS_ACC
        : ''
    );
    return filterTransactionFields(transactions);
  } else if (transactionType === 'transfers') {
    const transfers = await getTransfers(dateRange);
    return filterTransactionFields(transfers);
  }
};
