import { Color } from '@tremor/react';
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

// Account info returned to client
export interface AccountInfo {
  id: string;
  displayName: string;
  accountType: components['schemas']['AccountTypeEnum'];
}

export interface DbTransactionResource
  extends Omit<
    components['schemas']['TransactionResource'],
    'id' | 'attributes'
  > {
  _id: Binary;
  attributes: TransactionResourceAttributes;
}

export interface FilteredTransactionResource {
  id: string;
  description: string;
  rawText: string | null;
  amount: string;
  amountRaw: number;
  time: string;
  status: string;
  category: string;
  parentCategory: string;
  tags: string[];
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

export type TransactionRetrievalOptions = {
  sort: 'time' | 'amount';
  sortDir: 'asc' | 'desc';
  limit?: number;
  type?: 'income' | 'expense';
};

export type TransactionAccountType = 'transactional' | 'savings';

export type StatCardInfo = {
  title?: string;
  metric?: string | number | undefined;
  icon?: any;
  color?: Color;
  isLoading?: boolean;
};
