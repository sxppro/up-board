import {
  DbTransactionResource,
  FilteredTransactionResource,
} from '@/types/custom';
import type { components } from '@/types/up-api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Currency formatter for numbers
 * @param number
 * @returns number formatted in AUD
 */
export const formatCurrency = (number: number, decimals: boolean = true) =>
  Intl.NumberFormat('default', {
    style: 'currency',
    currency: 'AUD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: decimals ? undefined : 0,
  })
    .format(number)
    .toString();

/**
 * Merges HTML class names
 * @param inputs array of class names
 * @returns
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Filters properties from raw transaction
 * object to be returned to client
 * @param transactions array of raw transaction objects
 * @returns
 */
export const filterTransactionFields = (
  transactions: components['schemas']['TransactionResource'][]
): FilteredTransactionResource[] => {
  return transactions.map((transaction) => {
    const { id, attributes, relationships } = transaction;
    return {
      id,
      description: attributes.description,
      amount: attributes.amount.value,
      time: attributes.createdAt,
      status: attributes.status,
      category: relationships.category.data?.id ?? 'uncategorised',
      parentCategory: relationships.parentCategory.data?.id ?? 'uncategorised',
      tags: relationships.tags.data.map(({ id }) => id),
    };
  });
};

/**
 * Remaps db transaction document
 * to be returned in API endpoint
 */
export const outputTransactionFields = (transaction: DbTransactionResource) => {
  const { _id, attributes, ...rest } = transaction;
  const { createdAt, settledAt } = attributes;
  const newAttributes = {
    ...attributes,
    settledAt: settledAt ? settledAt.toISOString() : settledAt,
    createdAt: createdAt ? createdAt.toISOString() : createdAt,
  };
  return {
    id: _id.toString(),
    attributes: newAttributes,
    ...rest,
  };
};
