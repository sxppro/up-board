'use client';

import AccountBalanceHistory from '@/components/charts/account-balance-history';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  cn,
  formatCurrency,
  formatCurrencyAbsolute,
  getDateRanges,
} from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { Info } from '@phosphor-icons/react';
import {
  LineChart,
  SparkAreaChart,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@tremor/react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import TopMerchants from './top-merchants';

interface CumulativeSnapshotProps {
  accountId: string; // Transaction account id
}

const CumulativeSnapshot = ({ accountId }: CumulativeSnapshotProps) => {
  const [incomeTab, setIncomeTab] = useState(0);
  const [expensesTab, setExpensesTab] = useState(0);
  const { thisMonthLastYear, last30days, lastYear, monthToDate, yearToDate } =
    getDateRanges();
  const { data: incomeData, dataUpdatedAt: incomeUpdatedAt } =
    trpc.public.getCumulativeIO.useQuery({
      dateRange: incomeTab === 0 ? monthToDate : yearToDate,
      compareDateRange: incomeTab === 0 ? thisMonthLastYear : lastYear,
      type: 'income',
    });
  const { data: expensesData, dataUpdatedAt: expensesUpdatedAt } =
    trpc.public.getCumulativeIO.useQuery({
      dateRange: expensesTab === 0 ? monthToDate : yearToDate,
      compareDateRange: expensesTab === 0 ? thisMonthLastYear : lastYear,
      type: 'expense',
    });
  const { data: month } = trpc.public.getIOStats.useQuery({
    dateRange: monthToDate,
  });
  const { data: year } = trpc.public.getIOStats.useQuery({
    dateRange: yearToDate,
  });
  const { data: transactionalBalanceHistory } =
    trpc.public.getAccountBalance.useQuery({
      accountType: 'TRANSACTIONAL',
      dateRange: last30days,
    });
  const { data: savingsBalanceHistory } =
    trpc.public.getAccountBalance.useQuery({
      accountType: 'SAVER',
      dateRange: last30days,
    });
  const { data: savingsAccounts } = trpc.public.getAccounts.useQuery({
    options: { match: { 'attributes.accountType': 'SAVER' } },
  });
  // Total savings
  const savingsBalance = savingsAccounts?.reduce(
    (acc, { balance }) => acc + balance,
    0
  );
  const { data: transactionalAcc } = trpc.public.getAccountById.useQuery({
    accountId,
  });
  const { data: expenseCategories } = trpc.public.getCategoryInfo.useQuery({
    dateRange: expensesTab === 0 ? monthToDate : yearToDate,
    type: 'child',
    options: {
      limit: 4,
      sort: {
        amount: 1,
        transactions: -1,
      },
    },
  });
  const { data: merchants } = trpc.public.getMerchantInfo.useQuery({
    dateRange: expensesTab === 0 ? monthToDate : yearToDate,
    type: 'expense',
    options: {
      limit: 4,
      sort: {
        amount: 1,
        transactions: -1,
      },
    },
  });

  return (
    <>
      <section aria-labelledby="overview-income">
        <div>
          <div className="flex items-center justify-between">
            <h1
              id="overview-income"
              className="text-2xl font-semibold tracking-tight"
            >
              Income
            </h1>
            <p className="text-sm text-muted-foreground">
              {incomeUpdatedAt
                ? `Updated ${format(incomeUpdatedAt, 'HH:mm')}`
                : 'Fetching...'}
            </p>
          </div>
          <Separator className="mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <TabGroup
            className="xl:col-span-2"
            onIndexChange={(index) => setIncomeTab(index)}
          >
            <TabList className="space-x-0 items-center border-b">
              <Tab className="flex-1 sm:flex-none pl-4 pr-12 py-3 border-b-2 border-transparent">
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-muted-foreground">Month to date</p>
                  {month ? (
                    <p className="text-xl text-foreground h-8">
                      {formatCurrency(month[0]?.In)}
                    </p>
                  ) : (
                    <Skeleton className="w-full h-8" />
                  )}
                </div>
              </Tab>
              <Separator orientation="vertical" className="h-[82px]" />
              <Tab className="flex-1 sm:flex-none pl-4 pr-12 py-3 border-b-2 border-transparent">
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-muted-foreground">Year to date</p>
                  {year ? (
                    <p className="text-xl text-foreground h-8">
                      {formatCurrency(year[0]?.In)}
                    </p>
                  ) : (
                    <Skeleton className="w-full h-8" />
                  )}
                </div>
              </Tab>
              <Separator
                orientation="vertical"
                className="hidden sm:block h-[82px]"
              />
            </TabList>
            <TabPanels>
              <TabPanel>
                {incomeData ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={incomeData}
                    index="FormattedDate"
                    categories={['This year', 'Last year']}
                    valueFormatter={(number: number) =>
                      formatCurrency(number, false)
                    }
                    showLegend={false}
                    showYAxis={false}
                    showAnimation
                    showGridLines
                  />
                ) : (
                  <Skeleton className="w-full h-64 sm:h-80" />
                )}
              </TabPanel>
              <TabPanel>
                {incomeData ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={incomeData}
                    index="FormattedDate"
                    categories={['This year', 'Last year']}
                    valueFormatter={(number: number) =>
                      formatCurrency(number, false)
                    }
                    showLegend={false}
                    showYAxis={false}
                    showAnimation
                    showGridLines
                  />
                ) : (
                  <Skeleton className="w-full h-64 sm:h-80" />
                )}
              </TabPanel>
            </TabPanels>
          </TabGroup>
          <div className="flex flex-col py-4 sm:p-4">
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex gap-0.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <span className="font-bold underline underline-offset-4 cursor-pointer">
                      Transaction account
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto">
                    <p className="text-sm">
                      Current balance of transactional account
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              {transactionalBalanceHistory && transactionalAcc ? (
                <>
                  <p className="text-2xl">
                    {formatCurrency(transactionalAcc.balance)}
                  </p>
                  <SparkAreaChart
                    className="w-full"
                    data={transactionalBalanceHistory}
                    index="FormattedDate"
                    categories={['Balance']}
                  />
                </>
              ) : (
                <Skeleton className="w-full h-20" />
              )}
            </div>
            <Separator className="my-4" />
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex gap-0.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <span className="font-bold underline underline-offset-4 cursor-pointer">
                      Savings
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto">
                    <p className="text-sm">
                      Current balance of all saver accounts
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              {savingsBalanceHistory && savingsBalance ? (
                <>
                  <p className="text-2xl">{formatCurrency(savingsBalance)}</p>
                  <SparkAreaChart
                    className="w-full"
                    data={savingsBalanceHistory}
                    index="FormattedDate"
                    categories={['Balance']}
                  />
                </>
              ) : (
                <Skeleton className="w-full h-20" />
              )}
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="overview-expenses">
        <div>
          <div className="flex items-center justify-between">
            <h1
              id="overview-expenses"
              className="text-2xl font-semibold tracking-tight"
            >
              Expenses
            </h1>
            <p className="text-sm text-muted-foreground">
              {expensesUpdatedAt
                ? `Updated ${format(expensesUpdatedAt, 'HH:mm')}`
                : 'Fetching...'}
            </p>
          </div>
          <Separator className="mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <TabGroup
            className="xl:col-span-2"
            onIndexChange={(index) => setExpensesTab(index)}
          >
            <TabList className="space-x-0 items-center border-b">
              <Tab className="flex-1 sm:flex-none pl-4 pr-12 py-3 border-b-2 border-transparent">
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-muted-foreground">Month to date</p>
                  {month ? (
                    <p className="text-xl text-foreground h-8">
                      {formatCurrency(month[0]?.Out)}
                    </p>
                  ) : (
                    <Skeleton className="w-full h-8" />
                  )}
                </div>
              </Tab>
              <Separator orientation="vertical" className="h-[82px]" />
              <Tab className="flex-1 sm:flex-none pl-4 pr-12 py-3 border-b-2 border-transparent">
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-muted-foreground">Year to date</p>
                  {year ? (
                    <p className="text-xl text-foreground h-8">
                      {formatCurrency(year[0]?.Out)}
                    </p>
                  ) : (
                    <Skeleton className="w-full h-8" />
                  )}
                </div>
              </Tab>
              <Separator
                orientation="vertical"
                className="hidden sm:block h-[82px]"
              />
            </TabList>
            <TabPanels>
              <TabPanel>
                {expensesData ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={expensesData}
                    index="FormattedDate"
                    categories={['This year', 'Last year']}
                    valueFormatter={(number: number) =>
                      formatCurrency(number, false)
                    }
                    showLegend={false}
                    showYAxis={false}
                    showAnimation
                    showGridLines
                  />
                ) : (
                  <Skeleton className="w-full h-64 sm:h-80" />
                )}
              </TabPanel>
              <TabPanel>
                {expensesData ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={expensesData}
                    index="FormattedDate"
                    categories={['This year', 'Last year']}
                    valueFormatter={(number: number) =>
                      formatCurrency(number, false)
                    }
                    showLegend={false}
                    showYAxis={false}
                    showAnimation
                    showGridLines
                  />
                ) : (
                  <Skeleton className="w-full h-64 sm:h-80" />
                )}
              </TabPanel>
            </TabPanels>
          </TabGroup>
          <div className="flex flex-col py-4 sm:p-4">
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex gap-0.5">
                <span className="font-bold">Top Categories</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-auto w-auto rounded-full p-1"
                    >
                      <Info />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto">
                    <p className="text-sm">
                      Categories ordered by total expenditure
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1">
                {expenseCategories
                  ? expenseCategories.map(
                      ({
                        category,
                        categoryName,
                        amount,
                        absAmount,
                        parentCategory,
                      }) => (
                        <div
                          key={category}
                          className="w-full flex h-8 items-center"
                        >
                          <div className="flex flex-1 gap-2 overflow-hidden">
                            <div
                              className={cn(
                                'inline-block h-6 w-1 rounded-full',
                                parentCategory
                                  ? `bg-up-${parentCategory}`
                                  : 'bg-up-uncategorised'
                              )}
                            />
                            <Button
                              variant="link"
                              className="h-6 p-0 text-subtle text-base truncate underline"
                              asChild
                            >
                              <Link
                                href={`/spending/${encodeURIComponent(category)}`}
                              >
                                {categoryName}
                              </Link>
                            </Button>
                          </div>
                          <span>
                            {formatCurrencyAbsolute(absAmount, amount)}
                          </span>
                        </div>
                      )
                    )
                  : [...Array(4).keys()].map((i) => (
                      <Skeleton key={i} className="h-8" />
                    ))}
              </div>
            </div>
            <Separator className="my-4" />
            <TopMerchants merchants={merchants} />
          </div>
        </div>
      </section>
      <section aria-labelledby="overview-savings">
        <div>
          <h1
            id="overview-savings"
            className="text-2xl font-semibold tracking-tight"
          >
            Savings
          </h1>
          <Separator className="mt-2" />
        </div>
        <AccountBalanceHistory accountType="SAVER" />
      </section>
    </>
  );
};

export default CumulativeSnapshot;
