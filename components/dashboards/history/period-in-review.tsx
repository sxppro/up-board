import {
  getCategoryInfo,
  getIOStats,
  getMerchantInfo,
  getTransactions,
} from '@/db';
import { filterTransactionFields } from '@/db/helpers';
import { DateRange } from '@/server/schemas';
import { colours } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';
import { Title } from '@tremor/react';
import { PropsWithChildren } from 'react';
import QueryProvider from '../../providers/query-provider';
import TransactionTable from '../../tables/transaction-table';
import TopItemsBarList from './top-items-bar-list';

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
  const merchantInfo = await getMerchantInfo(
    {
      sort: {
        amount: 1,
        transactions: -1,
      },
    },
    dateRange,
    'expense'
  );
  const subcategorySpending = await getCategoryInfo(dateRange, 'child', {
    sort: {
      amount: 1,
    },
  });
  const hourlySpending = await getIOStats({ groupBy: 'hourly' }, dateRange);
  console.log(hourlySpending);

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
        <TopItemsBarList
          title="Top Merchants"
          description="Merchants ordered by spending, excluding refunds"
          data={merchantInfo.map((merchant) => ({
            ...merchant,
            value: merchant.absAmount,
            href: `/merchant/${encodeURIComponent(merchant.name)}`,
            colour: merchant.parentCategoryName
              ? `bg-${colours[merchant.parentCategoryName]} bg-opacity-60`
              : `bg-${colours['Uncategorised']} bg-opacity-60`,
          }))}
        />
        {/* Top categories */}
        <TopItemsBarList
          className="xl:col-span-2"
          title="Top Categories"
          description="Categories ordered by total net spending"
          data={subcategorySpending.map((category) => ({
            ...category,
            name: category.categoryName,
            value: category.absAmount,
            href: `/spending/${encodeURIComponent(category.category)}`,
            colour: category.parentCategoryName
              ? `bg-${colours[category.parentCategoryName]} bg-opacity-60`
              : `bg-${colours['Uncategorised']} bg-opacity-60`,
          }))}
        />

        <TransactionTable
          className="col-span-full"
          transactions={transactions}
        />
      </div>
    </QueryProvider>
  );
};

export default PeriodInReview;
