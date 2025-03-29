import { outputTransactionFields } from '@/utils/helpers';
import { BarChartProps, Color } from '@tremor/react';
import type { DateRange } from 'react-day-picker';
import { components } from './up-api';

export type AccountType = components['schemas']['AccountTypeEnum'];

export type SerialisedDbTransactionResource = ReturnType<
  typeof outputTransactionFields
>;

export type DateRangeContext = {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
};

export interface DateRangeProps {
  start?: Date;
  end?: Date;
}

export type PageProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export type BarChartConfig = Omit<BarChartProps, 'categories'> & {
  categories: any[];
};

export enum DateRangePresets {
  TODAY = '24h',
  WEEK = '7d',
  MONTH = '30d',
  THREE_MONTHS = '3m',
  SIX_MONTHS = '6m',
  YEAR = '12m',
}

export type StatCardInfo = {
  title?: string;
  metric?: string | number | undefined;
  icon?: any;
  color?: Color;
  isLoading?: boolean;
};
