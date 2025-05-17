import { TransactionResourceFiltered } from '@/server/schemas';
import { components } from '@/types/up-api';
import { getCategoryById } from '.';

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
      const filteredTransaction = {
        id,
        attachment: relationships.attachment.data?.id ?? null,
        amount: attributes.amount.value,
        amountRaw: attributes.amount.valueInBaseUnits / 100,
        description: attributes.description,
        isCategorizable: attributes.isCategorizable,
        message: attributes.message,
        category,
        parentCategory:
          relationships.parentCategory.data?.id ?? 'uncategorised',
        note: attributes.note?.text ?? null,
        rawText: attributes.rawText,
        status: attributes.status,
        tags: relationships.tags.data.map(({ id }) => id),
        time: attributes.createdAt,
        transactionType: attributes.transactionType,
        // @ts-expect-error due to Up Banking API not being updated yet
        deepLinkURL: attributes.deepLinkURL,
      };
      if (
        // @ts-expect-error Some pipeline queries will include category names
        // because of lookupCategoryNames(), so only do the category name lookup
        // if the category names are not already present
        !relationships.category.data?.name ||
        // @ts-expect-error
        !relationships.parentCategory.data?.name
      ) {
        const categoryDetails = await getCategoryById(category);
        return {
          ...filteredTransaction,
          categoryName: categoryDetails?.name ?? 'Uncategorised',
          parentCategoryName:
            categoryDetails?.parentCategoryName ?? 'Uncategorised',
        };
      } else {
        return {
          ...filteredTransaction,
          // @ts-expect-error
          categoryName: relationships.category.data.name,
          // @ts-expect-error
          parentCategoryName: relationships.parentCategory.data.name,
        };
      }
    }) || []
  );
};
