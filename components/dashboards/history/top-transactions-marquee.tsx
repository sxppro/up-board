import TransactionPopover from '@/components/transaction-popover';
import { Marquee } from '@/components/ui/magicui/marquee';
import { getTransactions } from '@/db';
import { filterTransactionFields } from '@/db/helpers';
import { DateRange, TransactionResourceFiltered } from '@/server/schemas';
import { cn, formatCurrency } from '@/utils/helpers';
import { Card } from '@tremor/react';
import { format } from 'date-fns';

const TransactionCard = ({ tx }: { tx: TransactionResourceFiltered }) => {
  const { id, description, amountRaw, parentCategory, time } = tx;
  return (
    <TransactionPopover id={id}>
      <Card
        decoration={'left'}
        decorationColor={`up-${parentCategory}`}
        className={cn(
          'h-16 w-64 flex items-center justify-between cursor-pointer overflow-hidden rounded-xl px-4 py-2 transition',
          // light styles
          'bg-gray-950/[.01] hover:bg-gray-950/[.05]',
          // dark styles
          'dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]'
        )}
      >
        <div>
          <p className="text-xs text-subtle mb-1">
            {format(time, 'd MMM yyy')}
          </p>
          <p className="text-sm font-medium line-clamp-1">{description}</p>
        </div>
        <blockquote className="text-lg font-semibold">
          {formatCurrency(amountRaw)}
        </blockquote>
      </Card>
    </TransactionPopover>
  );
};

const TopTransactionsMarquee = async ({
  dateRange,
}: {
  dateRange: DateRange;
}) => {
  const data = await getTransactions({
    match: {
      'attributes.isCategorizable': true,
      'attributes.createdAt': {
        $gte: dateRange.from,
        $lte: dateRange.to,
      },
    },
    sort: {
      'attributes.amount.valueInBaseUnits': 1,
    },
    limit: 20,
  });
  const transactions = await filterTransactionFields(data);
  const firstRowTx = transactions.slice(0, transactions.length / 2);
  const secondRowTx = transactions.slice(transactions.length / 2);

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden xl:col-span-3">
      <Marquee className="[--duration:60s]">
        {firstRowTx.map((tx) => (
          <TransactionCard key={tx.id} tx={tx} />
        ))}
      </Marquee>
      <Marquee reverse className="[--duration:60s]">
        {secondRowTx.map((tx) => (
          <TransactionCard key={tx.id} tx={tx} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
};

export default TopTransactionsMarquee;
