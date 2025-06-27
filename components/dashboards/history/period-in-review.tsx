import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import ExpenseCategoriesDonut from '@/components/charts/expense-categories-donut';
import {
  getCategoryInfo,
  getIOStats,
  getMerchantInfo,
  getTransactions,
} from '@/db';
import { DateRange } from '@/server/schemas';
import { colours, now } from '@/utils/constants';
import { cn, formatCurrency } from '@/utils/helpers';
import { CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { Title } from '@tremor/react';
import { format, setHours, setMinutes } from 'date-fns';
import { PropsWithChildren, Suspense } from 'react';
import QueryProvider from '../../providers/query-provider';
import TransactionTable from '../../tables/transaction-table';
import TopItemsBarList from './top-items-bar-list';
import TopTransactionsMarquee from './top-transactions-marquee';

interface PeriodInReviewProps {
  dateRange: DateRange;
}

const PeriodInReview = async ({
  dateRange,
  children: title,
}: PeriodInReviewProps & PropsWithChildren) => {
  const io = (await getIOStats({}, dateRange))[0];
  const transactions = await getTransactions({
    match: {
      'attributes.isCategorizable': true,
      'attributes.createdAt': {
        $gte: dateRange.from,
        $lte: dateRange.to,
      },
    },
  });
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
        <section
          aria-label="Period in review"
          className="flex flex-col gap-2 justify-end xl:col-span-2"
        >
          {title}
          {io ? (
            <div
              className={cn(
                'flex flex-col sm:flex-row p-4 rounded-tremor-default',
                // light styles
                'bg-gray-950/[.01]',
                // dark styles
                'dark:bg-gray-50/[.10]'
              )}
            >
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-sm text-subtle">Money In</p>
                <p className="font-semibold">{formatCurrency(io?.In)}</p>
              </div>
              <div className="border-b my-4 sm:border-r sm:mx-4" />
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-sm text-subtle">Money Out</p>
                <p className="font-semibold">{formatCurrency(io?.Out)}</p>
              </div>
              <div className="border-b my-4 sm:border-r sm:mx-4" />
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-sm text-subtle">Net</p>
                <p className="font-semibold">{formatCurrency(io?.Net)}</p>
              </div>
              <div className="border-b my-4 sm:border-r sm:mx-4" />
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-sm text-subtle">Transactions</p>
                <p className="font-semibold">{io?.Transactions}</p>
              </div>
            </div>
          ) : null}
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
        {/* Top transactions marquee */}
        <Suspense
          fallback={
            <div className="h-40 flex flex-col items-center justify-center gap-2 m-auto xl:col-span-3">
              <CircleNotch className="h-8 w-8 animate-spin" />
              <p className="text-xl tracking-tight">
                Loading your top transactions...
              </p>
            </div>
          }
        >
          <TopTransactionsMarquee dateRange={dateRange} />
        </Suspense>
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

        <TransactionTable
          className="col-span-full"
          transactions={transactions}
        />
      </div>
    </QueryProvider>
  );
};

export default PeriodInReview;
