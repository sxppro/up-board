import { getCategoryInfo, getIOStats, getTransactions } from '@/db';
import { DateRange } from '@/server/schemas';
import { PropsWithChildren } from 'react';
import QueryProvider from '../../../providers/query-provider';
import TransactionTable from '../../../tables/transaction-table';

interface PeriodInReviewProps {
  dateRange: DateRange;
}

const PeriodInReview = async ({
  dateRange,
  children,
}: PeriodInReviewProps & PropsWithChildren) => {
  const io = await getIOStats({}, dateRange);
  const transactions = await getTransactions({
    match: {
      'attributes.isCategorizable': true,
      'attributes.createdAt': {
        $gte: dateRange.from,
        $lte: dateRange.to,
      },
    },
  });
  const subcategorySpending = await getCategoryInfo(dateRange, 'child', {
    sort: {
      amount: 1,
    },
  });
  console.log(io);
  console.log(subcategorySpending);

  return (
    <QueryProvider>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <section aria-label="period in review" className="xl:col-span-2">
          {children}
        </section>
        <TransactionTable
          className="col-span-full"
          transactions={transactions}
        />
      </div>
    </QueryProvider>
  );
};

export default PeriodInReview;
