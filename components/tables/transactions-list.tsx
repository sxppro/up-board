import {
  formatCurrency,
  formatDate,
  outputTransactionFields,
} from '@/utils/helpers';
import TransactionPopover from '../transaction-popover';
import { Separator } from '../ui/separator';

interface TransactionsListProps {
  transactions: {
    timestamp: Date | string;
    transactions: ReturnType<typeof outputTransactionFields>[];
  }[];
}

/**
 * List of transactions grouped by day
 * @returns
 */
const TransactionsList = ({ transactions }: TransactionsListProps) => {
  return transactions.map(({ timestamp, transactions }) => (
    // Timestamp may be a string or a Date object depending on
    // whether data is fetched on server or client
    <div key={timestamp instanceof Date ? timestamp.toISOString() : timestamp}>
      <p className="text-lg font-bold">{formatDate(timestamp)}</p>
      <Separator className="mt-1" />
      {transactions.map(({ id, attributes }) => (
        <TransactionPopover key={id} id={id}>
          <div className="flex py-1.5 px-3 -mx-3 items-center text-sm font-medium overflow-hidden rounded-lg transition-colors cursor-pointer hover:bg-muted/50">
            <p className="flex-1 text-subtle truncate">
              {attributes.description}
            </p>
            <span>
              {formatCurrency(attributes.amount.valueInBaseUnits / 100)}
            </span>
          </div>
        </TransactionPopover>
      ))}
    </div>
  ));
};

export default TransactionsList;
