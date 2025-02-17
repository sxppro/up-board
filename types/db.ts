import type { Binary } from 'bson';
import { components } from './up-api';

/**
 * Resources as stored in db (MongoDB)
 */
export interface DbAccountResource
  extends Omit<components['schemas']['AccountResource'], 'id'> {
  _id: string;
}

export interface DbCategoryResource
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

export interface TransactionResourceAttributes
  extends Omit<
    components['schemas']['TransactionResource']['attributes'],
    'createdAt' | 'settledAt'
  > {
  createdAt: Date;
  settledAt: Date | null;
}
