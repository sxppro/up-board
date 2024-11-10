import { BalanceHistory } from '@/server/schemas';
import { DbTransactionResource } from '@/types/custom';
import { tz } from '@date-fns/tz';
import { clsx, type ClassValue } from 'clsx';
import {
  differenceInDays,
  format,
  formatDistanceStrict,
  isToday,
  isYesterday,
} from 'date-fns';
import { enAU } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';
import { now, TZ } from './constants';

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
export const formatCurrency = (
  number?: number,
  decimals: boolean = true,
  compact: boolean = false
) =>
  Intl.NumberFormat('default', {
    style: 'currency',
    currency: 'AUD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: decimals ? undefined : 0,
    ...(compact && { notation: 'compact', compactDisplay: 'short' }),
  })
    .format(number ?? 0)
    .toString();

/**
 * Format date depending on distance to now
 * @param date date to format
 * @returns formatted date string
 */
export const formatDate = (date: Date | string) => {
  if (isToday(date, { in: tz(TZ) })) return 'Today';
  if (isYesterday(date, { in: tz(TZ) })) return 'Yesterday';
  if (differenceInDays(now, date, { in: tz(TZ) }) > 7)
    return format(date, 'do MMMM', { in: tz(TZ) });
  return formatDistanceStrict(date, now, {
    addSuffix: true,
    roundingMethod: 'floor',
    locale: enAU,
    in: tz(TZ),
  });
};

/**
 * Capitalise first letter of string
 * @param str
 * @returns
 */
export const capitalise = (str: string) =>
  str.charAt(0).toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();

/**
 * Percentage difference of a
 * relative to b
 * @param a
 * @param b
 * @returns
 */
export const calcPercentDiff = (a: number, b: number) => ((a - b) / b) * 100;

/**
 * Adds property `FormattedDate`, date string from day, month, year values
 * @param data
 * @returns
 */
export const addFormattedDate = (data: BalanceHistory[] | undefined) => {
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

/**
 * Map search params
 */
export const getSearchParams = (
  ...params: (string | string[] | undefined)[]
) => {
  return params.map((param) => (Array.isArray(param) ? param[0] : param));
};
