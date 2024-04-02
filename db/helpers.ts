import { TransactionRetrievalOptions } from '@/server/schemas';
import { filterTransactionFields } from '@/utils/helpers';
import { getTransactionsByDate, getTransfers } from '.';

export const getTransactions = async (
  retrievalOpts: TransactionRetrievalOptions
) => {
  const { account, dateRange, type, ...options } = retrievalOpts;
  if (type === 'transactions') {
    const transactions = await getTransactionsByDate(
      account === 'transactional'
        ? process.env.UP_TRANS_ACC || ''
        : account === 'savings'
        ? process.env.UP_SAVINGS_ACC || ''
        : '',
      dateRange,
      options
    );
    return filterTransactionFields(transactions);
  } else if (type === 'transfers') {
    const transfers = await getTransfers(dateRange);
    return filterTransactionFields(transfers);
  }
};
