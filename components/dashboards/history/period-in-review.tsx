import AccountBalanceHistory from '@/components/charts/account-balance-history';
import ExpenseCategoriesDonut from '@/components/charts/expense-categories-donut';
import { getCategoryInfo, getIOStats, getMerchantInfo } from '@/db';
import { DateRange } from '@/server/schemas';
import { colours, now } from '@/utils/constants';
import { cn, formatCurrency } from '@/utils/helpers';
import {
  CircleNotch,
  Equals,
  Receipt,
  TrendDown,
  TrendUp,
} from '@phosphor-icons/react/dist/ssr';
import { Title } from '@tremor/react';
import { format, setHours, setMinutes } from 'date-fns';
import Link from 'next/link';
import { PropsWithChildren, Suspense } from 'react';
import QueryProvider from '../../providers/query-provider';
import TopItemsBarList from './top-items-bar-list';
import TopTransactionsMarquee from './top-transactions-marquee';
import TransactionsByHour from './transactions-by-hour';

interface PeriodInReviewProps {
  dateRange: DateRange;
}

const PeriodInReview = async ({
  dateRange,
  children: title,
}: PeriodInReviewProps & PropsWithChildren) => {
  const io = (await getIOStats({}, dateRange))[0];
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
  // Calculate total spending for categories, excluding income
  const categorySpendingSum = categorySpending.reduce(
    (acc, { amount }) => (amount < 0 ? acc + amount : acc + 0),
    0
  );
  const subcategorySpending = await getCategoryInfo(dateRange, 'child', {
    sort: {
      absAmount: -1,
    },
  });
  const hourlySpending = await getIOStats({ groupBy: 'hourly' }, dateRange);

  return (
    <QueryProvider>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
          <section
            aria-label="Period in review"
            className="flex flex-col gap-4 xl:col-span-2"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              {title}
              <p className="text-sm text-muted-foreground">
                {`${format(dateRange.from, 'MMMM d, yyyy')} - ${format(dateRange.to, 'MMMM d, yyyy')}`}
              </p>
            </div>
            {io ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                      <TrendUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Money In
                    </p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(io?.In)}</p>
                </div>

                <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/20">
                      <TrendDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Money Out
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(io?.Out)}
                  </p>
                </div>

                <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'p-2 rounded-md',
                        io?.Net >= 0
                          ? 'bg-blue-100 dark:bg-blue-900/20'
                          : 'bg-orange-100 dark:bg-orange-900/20'
                      )}
                    >
                      <Equals
                        className={cn(
                          'h-4 w-4',
                          io?.Net >= 0
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-orange-600 dark:text-orange-400'
                        )}
                      />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Net
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(io?.Net)}
                  </p>
                </div>

                <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                      <Receipt className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Transactions
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {io?.Transactions.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : null}
          </section>
          {/* Spending donut chart */}
          <section
            aria-label="Spending by category"
            className="h-full flex flex-col"
          >
            <Title className="py-4 sm:px-4">Spending</Title>
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
              <div className="w-full lg:w-auto lg:flex-shrink-0">
                <ExpenseCategoriesDonut
                  className="h-64 w-64 mx-auto text-2xl font-semibold"
                  data={categorySpending?.map(
                    ({ categoryName, absAmount, amount }) => ({
                      name: categoryName,
                      value: amount < 0 ? absAmount : 0,
                    })
                  )}
                  index="name"
                  colors={categorySpending?.map(
                    ({ category }) => `up-${category}`
                  )}
                />
              </div>
              <div className="w-full flex-1">
                <div className="space-y-3">
                  {categorySpending?.map(
                    ({ category, categoryName, absAmount, amount }) =>
                      amount < 0 ? (
                        <Link
                          href={`/spending?category=${category}`}
                          key={category}
                          className="group flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors duration-200"
                          aria-label={`View details for ${categoryName} spending`}
                        >
                          <div
                            className={cn(
                              'size-6 rounded-lg flex-shrink-0',
                              `bg-${colours[categoryName]} bg-opacity-80`
                            )}
                            aria-hidden="true"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-medium text-base text-foreground underline underline-offset-4 group-hover:text-accent-foreground truncate">
                                {categoryName}
                              </h4>
                              <div>
                                <span className="text-sm text-muted-foreground mr-2">
                                  {(
                                    (amount / categorySpendingSum) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                                <span className="font-semibold text-lg text-foreground flex-shrink-0">
                                  {formatCurrency(absAmount, true, true)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : null
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className="h-full flex flex-col gap-4">
            <Title className="py-4 sm:px-4">Savings</Title>
            <AccountBalanceHistory
              dateRange={dateRange}
              className="h-64 w-auto"
              accountType="SAVER"
            />
          </section>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <TransactionsByHour
            data={hourlySpending.map((spending) => ({
              ...spending,
              Hour: format(
                setMinutes(setHours(now, spending.Hour || 0), 0),
                'HH:mm'
              ),
            }))}
          />
          {/* Number of unique merchants */}
          <section
            aria-label="Unique merchants"
            className="h-full border rounded-tremor-default flex flex-col gap-4 p-4"
          >
            <Title>Unique Merchants</Title>
            <p className="text-4xl sm:text-6xl font-semibold">
              {merchantInfo.length.toLocaleString()}
            </p>
          </section>
        </div>
      </div>
    </QueryProvider>
  );
};

export default PeriodInReview;
