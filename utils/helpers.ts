import {
  DateRange,
  DateRangeGroupBy,
  TransactionCategoryInfoHistoryRaw,
} from '@/server/schemas';
import { DbTransactionResource } from '@/types/db';
import { tz } from '@date-fns/tz';
import { clsx, type ClassValue } from 'clsx';
import {
  differenceInDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfMonth,
  endOfYear,
  format,
  formatDistanceStrict,
  isThisYear,
  isToday,
  isYesterday,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
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
  compact: boolean = false,
  signDisplay: 'auto' | 'never' = 'auto'
) =>
  Intl.NumberFormat('default', {
    style: 'currency',
    currency: 'AUD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: decimals ? undefined : 0,
    signDisplay,
    ...(compact && { notation: 'compact', compactDisplay: 'short' }),
  })
    .format(number ?? 0)
    .toString();

/**
 * Append '+' to formatted currency if
 * absolute amount is equal to original amount
 * @param absAmount absolute monetary amount
 * @param amount monetary amount
 * @returns
 */
export const formatCurrencyAbsolute = (
  absAmount: number,
  ...opts: Parameters<typeof formatCurrency>
) => {
  const [amount, ...rest] = opts;
  return `${amount === absAmount ? '+' : ''}${formatCurrency(absAmount, ...rest)}`;
};

/**
 * Format date depending on distance to now
 * @param date date to format
 * @returns formatted date string
 */
export const formatDate = (date: Date | string) => {
  if (isToday(date, { in: tz(TZ) })) return 'Today';
  if (isYesterday(date, { in: tz(TZ) })) return 'Yesterday';
  if (differenceInDays(now, date, { in: tz(TZ) }) > 7)
    return isThisYear(date, { in: tz(TZ) })
      ? format(date, 'do MMMM', { in: tz(TZ) })
      : format(date, 'do MMMM yyyy', { in: tz(TZ) });
  return formatDistanceStrict(date, now, {
    addSuffix: true,
    roundingMethod: 'floor',
    locale: enAU,
    in: tz(TZ),
  });
};

/**
 * Format date with time
 * @param date date to format
 * @returns formatted date string
 */
export const formatDateWithTime = (date: Date | string) => {
  if (isToday(date, { in: tz(TZ) }))
    return `Today, ${format(date, 'p', { in: tz(TZ) })}`;
  if (isYesterday(date, { in: tz(TZ) }))
    return `Yesterday, ${format(date, 'p', { in: tz(TZ) })}`;
  return format(date, 'dd/LL/yy, p', { in: tz(TZ) });
};

/**
 * Format historical time-series data for Tremor bar chart
 * ! Assumes data is given in oldest to newest order
 * @param data
 * @returns
 */
export const formatHistoricalData = (
  data: TransactionCategoryInfoHistoryRaw[],
  dateRange: DateRange,
  groupBy: DateRangeGroupBy
) => {
  const dayMonthYearFormat = 'dd LLL yy';
  const monthYearFormat = 'LLL yy';
  const yearFormat = 'yyyy';
  // Add entry for missing time period or uses existing data
  const fillMappedData = (formattedDate: string) => {
    const existingData = mappedData.find(
      ({ FormattedDate }) => FormattedDate === formattedDate
    );
    return {
      ...(existingData ? existingData : {}),
      FormattedDate: formattedDate,
    };
  };

  // Mapped data that may contain gaps between periods
  // e.g. months with no data
  const mappedData = data.map(({ month, year, categories }) => {
    const date =
      month && year
        ? format(new Date(year, month - 1), monthYearFormat)
        : format(new Date(year, 0), yearFormat);
    const remappedElem: any = {
      FormattedDate: date,
    };
    categories.map(
      ({ amount, categoryName }) => (remappedElem[categoryName] = amount)
    );
    return remappedElem;
  });

  // Fill in gaps in time-series data
  if (data.length > 0) {
    if (groupBy === 'daily') {
      // Daily
      const res = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to,
      })
        .map((date) => format(date, dayMonthYearFormat))
        .map(fillMappedData);
      return res;
    } else if (groupBy === 'monthly') {
      // Monthly
      const res = eachMonthOfInterval({
        start: dateRange.from,
        end: dateRange.to,
      })
        .map((date) => format(date, monthYearFormat))
        .map(fillMappedData);
      return res;
    } else {
      // Yearly
      const res = eachYearOfInterval({
        start: dateRange.from,
        end: dateRange.to,
      })
        .map((date) => format(date, yearFormat))
        .map(fillMappedData);
      return res;
    }
  }
  return mappedData;
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

/**
 * Utility date ranges
 * @returns
 */
export const getDateRanges = () => {
  const thisMonth = {
    from: startOfMonth(now),
    to: endOfMonth(now),
  };

  const thisMonthLastYear = {
    from: subYears(thisMonth.from, 1),
    to: subYears(thisMonth.to, 1),
  };

  const thisYear = {
    from: startOfYear(now),
    to: endOfYear(now),
  };

  const lastYear = {
    from: subYears(thisYear.from, 1),
    to: subYears(thisYear.to, 1),
  };

  const monthToDate = {
    from: startOfMonth(now),
    to: now,
  };

  const yearToDate = {
    from: startOfYear(now),
    to: now,
  };

  const last24hours = {
    from: subDays(now, 1),
    to: now,
  };

  const last7days = {
    from: subDays(now, 7),
    to: now,
  };

  const last30days = {
    from: subDays(now, 30),
    to: now,
  };

  const last3months = {
    from: subMonths(now, 3),
    to: now,
  };

  const last6months = {
    from: subMonths(now, 6),
    to: now,
  };

  const last12months = {
    from: subYears(now, 1),
    to: now,
  };

  return {
    thisMonth,
    thisYear,
    thisMonthLastYear,
    lastYear,
    last24hours,
    last7days,
    last30days,
    last3months,
    last6months,
    last12months,
    monthToDate,
    yearToDate,
  };
};
