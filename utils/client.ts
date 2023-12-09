/**
 * Client-side data fetching
 */

import startOfMonth from 'date-fns/startOfMonth';
import subYears from 'date-fns/subYears';

import type { components } from '@/types/up-api';
import useSWR from 'swr';

const fetcher = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init).then((res) => res.json());
/**
 * Retrieves past 12 months of transactions to date
 * @param date
 */
const getTransactionsByYear = async (date: Date) => {
  const startDate = startOfMonth(subYears(date, 1));

  try {
    const data = await getTransactionsByDates(startDate, date);
    return data?.data;
  } catch (err) {
    console.error(err);
  }
};

/**
 * Retrieves transactions between start and end dates
 * @param start start date
 * @param end end date
 * @returns list of transactions or error
 */
const getTransactionsByDates = async (start: Date, end: Date) => {
  const res = await fetch(
    '/api/transactions?' +
      new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
      })
  );
  if (res.ok) {
    const json: {
      data?: components['schemas']['TransactionResource'][];
      error?: components['schemas']['ErrorObject'][];
    } = await res.json();
    return json;
  } else {
    throw new Error(`${res.status} — ${res.statusText}`);
  }
};

const useMonthlyMetrics = (start: Date, end: Date) => {
  const { data, error, isLoading } = useSWR(
    '/api/metrics?' +
      new URLSearchParams({
        type: 'monthly',
        start: start.toISOString(),
        end: end.toISOString(),
      }),
    fetcher
  );

  return {
    data: data?.data || data,
    isLoading,
    isError: error,
  };
};

const useCategoryMetrics = (start: Date, end: Date) => {
  const { data, error, isLoading } = useSWR(
    '/api/metrics?' +
      new URLSearchParams({
        type: 'category',
        start: start.toISOString(),
        end: end.toISOString(),
      }),
    fetcher
  );

  return {
    data: data?.data || data,
    isLoading,
    isError: error,
  };
};

export {
  getTransactionsByDates,
  getTransactionsByYear,
  useCategoryMetrics,
  useMonthlyMetrics,
};
