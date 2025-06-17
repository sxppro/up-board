import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import ExpenseCategoriesDonut from '@/components/charts/expense-categories-donut';
import {
  getCategoryInfo,
  getIOStats,
  getMerchantInfo,
  getTransactions,
} from '@/db';
import { filterTransactionFields } from '@/db/helpers';
import { DateRange } from '@/server/schemas';
import { colours, now } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';
import { Title } from '@tremor/react';
import { format, setHours, setMinutes } from 'date-fns';
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
  const largestTransactions = await getTransactions({
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
  const largestTx = (await filterTransactionFields(largestTransactions))[0];
  const merchantInfo = await getMerchantInfo(
    {
      // Exclude income
      match: {
        'attributes.transactionType': {
          $nin: ['Salary'],
        },
      },
      sort: {
        absAmount: -1,
        transactions: -1,
      },
    },
    dateRange
  );
  const categorySpending = await getCategoryInfo(dateRange, 'parent', {
    sort: {
      absAmount: -1,
    },
  });
  const subcategorySpending = await getCategoryInfo(dateRange, 'child', {
    sort: {
      absAmount: -1,
    },
  });
  const hourlySpending = await getIOStats({ groupBy: 'hourly' }, dateRange);

  return (
    <QueryProvider>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <section aria-label="Period in review" className="xl:col-span-2">
          {children}
        </section>
        {/* Spending donut chart */}
        <section
          aria-label="Spending by category"
          className="h-full border rounded-tremor-default flex flex-col gap-4 p-4"
        >
          <Title>Spending Overview</Title>
          <ExpenseCategoriesDonut
            className="h-64 text-2xl font-semibold"
            data={categorySpending?.map(
              ({ categoryName, absAmount, amount }) => ({
                name: categoryName,
                value: amount < 0 ? absAmount : 0,
              })
            )}
            index="name"
            colors={categorySpending?.map(({ category }) => `up-${category}`)}
          />
        </section>
        {/* Top merchants */}
        <TopItemsBarList
          title="Spending by Merchant"
          tooltip="Excludes income"
          description="Merchants ordered by total net spending"
          data={merchantInfo.map((merchant) => ({
            ...merchant,
            value: merchant.amount,
            href: `/merchant/${encodeURIComponent(merchant.name)}`,
            colour: merchant.parentCategoryName
              ? `bg-${colours[merchant.parentCategoryName]} bg-opacity-60`
              : `bg-${colours['Uncategorised']} bg-opacity-60`,
          }))}
        />
        {/* Top categories */}
        <TopItemsBarList
          className="xl:col-span-2"
          title="Spending by Category"
          tooltip="Excludes income"
          description="Categories ordered by total net spending"
          data={subcategorySpending.map((category) => ({
            ...category,
            name: category.categoryName,
            value: category.amount,
            href: `/spending/${encodeURIComponent(category.category)}`,
            colour: category.parentCategoryName
              ? `bg-${colours[category.parentCategoryName]} bg-opacity-60`
              : `bg-${colours['Uncategorised']} bg-opacity-60`,
          }))}
        />
        {/* Transactions by hour */}
        <section
          aria-label="Transactions by hour"
          className="h-full border rounded-tremor-default flex flex-col gap-4 p-4 xl:col-span-2"
        >
          <Title>Transactions by Hour</Title>
          <ExpenseCategoriesBar
            data={hourlySpending.map((spending) => ({
              ...spending,
              Hour: format(
                setMinutes(setHours(now, spending.Hour || 0), 0),
                'HH:mm'
              ),
            }))}
            categories={['In', 'Out']}
            colors={['indigo', 'fuchsia']}
            index="Hour"
          />
        </section>
        {/* Largest transaction */}
        <section
          aria-label="Largest transaction"
          className="h-full border rounded-tremor-default flex flex-col justify-between gap-4 p-4"
        >
          <Title>Largest Transaction</Title>
          <p className="font-bold text-7xl/loose sm:text-6xl/loose py-8">
            {largestTx?.amountRaw
              ? formatCurrency(largestTx.amountRaw, false)
              : '—'}
          </p>
          <p className="font-medium text-end">
            {largestTx?.description ? largestTx.description : '—'}
          </p>
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
