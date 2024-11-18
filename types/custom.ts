import { BarChartProps, Color } from '@tremor/react';
import { components } from './up-api';

import type { Binary } from 'bson';
import type { DateRange } from 'react-day-picker';

interface TransactionResourceAttributes
  extends Omit<
    components['schemas']['TransactionResource']['attributes'],
    'createdAt' | 'settledAt'
  > {
  createdAt: Date;
  settledAt: Date | null;
}

// Account info as stored in db
export interface AccountResource
  extends Omit<components['schemas']['AccountResource'], 'id'> {
  _id: string;
}

export interface CategoryResource
  extends Omit<components['schemas']['CategoryResource'], 'id'> {
  _id: string;
}

export interface DbTransactionResource
  extends Omit<
    components['schemas']['TransactionResource'],
    'id' | 'attributes'
  > {
  _id: Binary;
  attributes: TransactionResourceAttributes;
}

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
