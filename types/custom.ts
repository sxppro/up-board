import { components } from './up-api';

import type { Binary } from 'bson';

interface CustomTransactionResource
  extends Omit<components['schemas']['TransactionResource'], 'id'> {
  _id: Binary;
}

export type { CustomTransactionResource };
