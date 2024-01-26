import {
  AccountBalanceHistory,
  DbTransactionResource,
  FilteredTransactionResource,
} from '@/types/custom';
import type { components } from '@/types/up-api';
import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export const getBaseUrl = () => {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';
  if (process.env.VERCEL_URL)
    // vercel
    return `https://${process.env.VERCEL_URL}`;
  // localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

/**
 * Debounces a callback
 * @param callback
 * @param wait
 * @returns
 */
export const debounce = (callback: Function, wait: number) => {
  let timeoutId: number | undefined;

  return (...args: any[]) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

/**
 * Currency formatter for numbers
 * @param number number to format
 * @param decimals include decimals
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
 * Adds property `FormattedDate`, date string from day, month, year values
 * @param data
 * @returns
 */
export const formatDateFromNums = (
  data: AccountBalanceHistory[] | undefined
) => {
  return data
    ? data.map(({ Day, Month, Year, ...rest }) => {
        const date = new Date(Year, Month - 1, Day);
        return {
          ...rest,
          FormattedDate: format(date, 'dd LLL yy'),
        };
      })
    : [];
};

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
      rawText: attributes.rawText,
      amount: attributes.amount.value,
      amountRaw: attributes.amount.valueInBaseUnits / 100,
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
