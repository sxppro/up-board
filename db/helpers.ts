import { TransactionRetrievalOptions } from '@/server/schemas';
import { filterTransactionFields } from '@/utils/helpers';
import { getTransactionsByDate } from '.';

/**
 * Retrieves transactions using various options
 * @param retrievalOpts
 * @returns
 */
export const getTransactions = async (
  retrievalOpts: TransactionRetrievalOptions
) => {
  const { account } = retrievalOpts;
  const transactions = await getTransactionsByDate(
    retrievalOpts,
    account === 'transactional'
      ? process.env.UP_TRANS_ACC
      : account === 'savings'
      ? process.env.UP_SAVINGS_ACC
      : ''
  );
  return filterTransactionFields(transactions);
};
