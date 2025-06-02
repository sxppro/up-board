import { getCategoryInfo, getIOStats, getTransactions } from '@/db';
import { filterTransactionFields } from '@/db/helpers';
import { DateRange } from '@/server/schemas';
import { formatCurrency } from '@/utils/helpers';
import { Title } from '@tremor/react';
import { PropsWithChildren } from 'react';
import QueryProvider from '../../../providers/query-provider';
import TransactionTable from '../../../tables/transaction-table';
import TopMerchantsBar from './top-merchants-bar';

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
  const largestTxRaw = await getTransactions({
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
    limit: 1,
  });
  const largestTx = (await filterTransactionFields(largestTxRaw))[0];
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
        {/* Largest transaction */}
        <section
          aria-label="largest transaction"
          className="h-full border rounded-tremor-default flex flex-col gap-2 p-4"
        >
          <Title>Largest Transaction</Title>
          <p className="font-bold text-7xl/loose sm:text-6xl/loose py-16">
            {largestTx?.amountRaw
              ? formatCurrency(largestTx.amountRaw, false)
              : '—'}
          </p>
          <p className="font-medium text-end">
            {largestTx?.description ? largestTx.description : '—'}
          </p>
        </section>
        {/* Top merchants */}
        <TopMerchantsBar dateRange={dateRange} />
        {/* Top categories */}
        <section aria-label="categories ordered by total expenditure"></section>

        <TransactionTable
          className="col-span-full"
          transactions={transactions}
        />
      </div>
    </QueryProvider>
  );
};

export default PeriodInReview;
