import { endOfDay } from 'date-fns';
import { useContext } from 'react';
import useSWR from 'swr';
import { fetcher } from './client';
import { DateContext } from './contexts';

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

export const useCategoryMetrics = (start: Date, end: Date) => {
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

export const useDate = () => {
  const { date, setDate } = useContext(DateContext);
  if (date.from && !date.to) {
    setDate({ ...date, to: endOfDay(date.from) });
  }
  return { date, setDate };
};
