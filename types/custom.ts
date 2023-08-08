import { components } from './up-api';

import type { Binary } from 'bson';

interface TransactionResourceAttributes
  extends Omit<
    components['schemas']['TransactionResource']['attributes'],
    'createdAt' | 'settledAt'
  > {
  createdAt: Date;
  settledAt: Date | null;
}

interface CustomTransactionResource
  extends Omit<
    components['schemas']['TransactionResource'],
    'id' | 'attributes'
  > {
  _id: Binary;
  attributes: TransactionResourceAttributes;
}

interface MonthlyMetric {
  Month: number;
  Year: number;
  Income: number;
  Expenses: number;
}

export type { CustomTransactionResource, MonthlyMetric };
