import {
  TransactionResourceFiltered,
  TransactionRetrievalOptions,
} from '@/server/schemas';
import { components } from '@/types/up-api';
import { getCategoryById, getTransactionsByDate } from '.';

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
  return await filterTransactionFields(transactions);
};
/**
 * Filters properties from raw transaction
 * object to be returned to client
 * @param transactions array of raw transaction objects
 * @returns
 */
export const filterTransactionFields = async (
  transactions?: components['schemas']['TransactionResource'][]
): Promise<TransactionResourceFiltered[]> => {
  return Promise.all(
    transactions?.map(async (transaction) => {
      const { id, attributes, relationships } = transaction;
      const category = relationships.category.data?.id ?? 'uncategorised';
      const categoryDetails = await getCategoryById(category);
      return {
        id,
        amount: attributes.amount.value,
        amountRaw: attributes.amount.valueInBaseUnits / 100,
        description: attributes.description,
        message: attributes.message,
        category,
        categoryName: categoryDetails?.name ?? 'Uncategorised',
        parentCategory:
          relationships.parentCategory.data?.id ?? 'uncategorised',
        parentCategoryName:
          categoryDetails?.parentCategoryName ?? 'Uncategorised',
        note: attributes.note?.text ?? null,
        rawText: attributes.rawText,
        status: attributes.status,
        tags: relationships.tags.data.map(({ id }) => id),
        time: attributes.createdAt,
        transactionType: attributes.transactionType,
        // @ts-expect-error due to Up Banking API not being updated yet
        deepLinkURL: attributes.deepLinkURL,
      };
    }) || []
  );
};
