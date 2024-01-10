import { endOfDay, startOfDay } from 'date-fns';
import { useContext } from 'react';
import useSWR from 'swr';
import { fetcher } from './client';
import { DateContext } from './contexts';
import { formatDateFromNums } from './helpers';

export const useMonthlyMetrics = (start: Date, end: Date) => {
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

export const useCategoryMetrics = (
  start: Date | undefined,
  end: Date | undefined,
  type: 'child' | 'parent'
) => {
  const now = new Date();
  const { data, error, isLoading } = useSWR(
    '/api/metrics?' +
      new URLSearchParams({
        type: type === 'parent' ? 'parentCategory' : 'category',
        start: start?.toISOString() || startOfDay(now).toISOString(),
        end: end?.toISOString() || endOfDay(now).toISOString(),
      }),
    fetcher
  );

  return {
    data: data?.data || data,
    isLoading,
    isError: error,
  };
};

export const useAccountBalanceHistorical = (
  start: Date | undefined,
  end: Date | undefined,
  account: 'transactional' | 'savings'
) => {
  const { data, error, isLoading } = useSWR(
    '/api/metrics?' +
      new URLSearchParams({
        type: 'accountBalance',
        start: start?.toISOString() || '',
        end: end?.toISOString() || '',
        account,
      }),
    fetcher
  );

  return {
    data: formatDateFromNums(data?.data || data),
    isLoading,
    isError: error,
  };
};

export const useTransactions = (
  start: Date | undefined,
  end: Date | undefined,
  sort: 'time' | 'amount',
  sortDir: 'asc' | 'desc'
) => {
  const now = new Date();
  const { data, error, isLoading } = useSWR(
    '/api/transactions?' +
      new URLSearchParams({
        start: start?.toISOString() || startOfDay(now).toISOString(),
        end: end?.toISOString() || endOfDay(now).toISOString(),
        sort,
        sortDir,
      }),
    fetcher
  );

  return {
    data: data?.data || data,
    isLoading,
    isError: error,
  };
};

export const useTransaction = (id: string) => {
  const { data, isLoading, error } = useSWR(`/api/transaction/${id}`, fetcher);
  return {
    data: data?.data || data,
    isLoading,
    isError: error,
  };
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within DateProvider');
  }
  return context;
};
