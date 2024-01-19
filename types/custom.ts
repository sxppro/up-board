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

export interface CategoryOption {
  value: string;
  name: string;
}

export interface MonthlyMetric {
  Year: number;
  Month: number;
  Day: undefined;
  Income: number;
  Expenses: number;
  Transactions: number;
}

export interface AccountBalanceHistory {
  Timestamp: string;
  Year: number;
  Month: number;
  Day: number;
  Amount: number;
  Balance: number;
}

export type DateRangeContext = {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
};

export type PageProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export type TransactionRetrievalOptions = {
  sort: 'time' | 'amount';
  sortDir: 'asc' | 'desc';
  limit?: number;
};

export type DateRangeNoUndef = {
  from: Date;
  to: Date;
};

export type TransactionAccountType = 'transactional' | 'savings';
