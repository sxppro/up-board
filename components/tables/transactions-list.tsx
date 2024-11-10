import {
  cn,
  formatCurrency,
  formatDate,
  outputTransactionFields,
} from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import { Note, Paperclip, Tag } from '@phosphor-icons/react/dist/ssr';
import TransactionPopover from '../transaction-popover';
import { Button } from '../ui/button';
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
  if (transactions.length === 0) {
    return <p className="text-muted-foreground">No transactions found.</p>;
  }
  return transactions.map(({ timestamp, transactions }) => (
    // Timestamp may be a string or a Date object depending on
    // whether data is fetched on server or client
    <div key={timestamp instanceof Date ? timestamp.toISOString() : timestamp}>
      <p className="text-lg font-bold">{formatDate(timestamp)}</p>
      <Separator className="mt-1" />
      <div className="flex flex-col">
        {transactions.map(({ id, attributes, relationships }) => (
          <TransactionPopover key={id} id={id}>
            <Button
              className={cn(
                'h-8 flex -mx-3 items-center justify-between gap-2 text-sm font-medium rounded-lg hover:bg-muted/80',
                focusRing
              )}
              variant="ghost"
            >
              <div className="flex items-center gap-1 overflow-hidden">
                <p className="text-left text-subtle truncate">
                  {attributes.description}
                </p>
                {relationships.tags.data.length > 0 && (
                  <Tag className="size-4 fill-fuchsia-600" />
                )}
                {attributes.note?.text && (
                  <Note className="size-4 fill-lime-600" />
                )}
                {relationships.attachment.data?.id && (
                  <Paperclip className="size-4 fill-rose-600" />
                )}
              </div>
              <span>
                {formatCurrency(attributes.amount.valueInBaseUnits / 100)}
              </span>
            </Button>
          </TransactionPopover>
        ))}
      </div>
    </div>
  ));
};

export default TransactionsList;
