'use client';

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
import { useState } from 'react';

interface CumulativeSnapshotProps {
  accountId: string;
  savAccountId: string;
}

const CumulativeSnapshot = ({
  accountId,
  savAccountId,
}: CumulativeSnapshotProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { thisMonthLastYear, lastYear, monthToDate, yearToDate } =
    getDateRanges();
  const { data: mtdIncome, dataUpdatedAt: dataUpdatedAtIncome } =
    trpc.public.getCumulativeIO.useQuery({
      accountId,
      dateRange: monthToDate,
      compareDateRange: thisMonthLastYear,
      type: 'income',
    });
  const { data: ytdIncome } = trpc.public.getCumulativeIO.useQuery({
    accountId,
    dateRange: yearToDate,
    compareDateRange: lastYear,
    type: 'income',
  });
  const { data: mtdExpenses, dataUpdatedAt: dataUpdatedAtExpenses } =
    trpc.public.getCumulativeIO.useQuery({
      accountId,
      dateRange: monthToDate,
      compareDateRange: thisMonthLastYear,
      type: 'expense',
    });
  const { data: ytdExpenses } = trpc.public.getCumulativeIO.useQuery({
    accountId,
    dateRange: yearToDate,
    compareDateRange: lastYear,
    type: 'expense',
  });
  ``;
  const { data: month } = trpc.public.getIOStats.useQuery({
    accountId,
    dateRange: monthToDate,
  });
  const { data: year } = trpc.public.getIOStats.useQuery({
    accountId,
    dateRange: yearToDate,
  });
  const { data: transactionalBalance } = trpc.public.getAccountBalance.useQuery(
    {
      accountId,
      dateRange: monthToDate,
    }
  );
  const { data: savingsBalance } = trpc.public.getAccountBalance.useQuery({
    accountId: savAccountId,
    dateRange: monthToDate,
  });
  const { data: savingsAcc } = trpc.public.getAccountById.useQuery({
    accountId: savAccountId,
  });
  const { data: transactionalAcc } = trpc.public.getAccountById.useQuery({
    accountId,
  });
  const { data: expenseCategories } = trpc.public.getCategoryInfo.useQuery({
    dateRange: selectedTab === 0 ? monthToDate : yearToDate,
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
    dateRange: selectedTab === 0 ? monthToDate : yearToDate,
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
              {dataUpdatedAtIncome
                ? `Updated ${format(dataUpdatedAtIncome, 'HH:mm')}`
                : 'Fetching...'}
            </p>
          </div>
          <Separator className="mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <TabGroup className="xl:col-span-2">
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
                {mtdIncome ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={mtdIncome}
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
                {ytdIncome ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={ytdIncome}
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
              {transactionalBalance && transactionalAcc ? (
                <>
                  <p className="text-2xl">
                    {formatCurrency(transactionalAcc.balance)}
                  </p>
                  <SparkAreaChart
                    className="w-full"
                    data={transactionalBalance}
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
                      Current balance of largest saver account
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              {savingsBalance && savingsAcc ? (
                <>
                  <p className="text-2xl">
                    {formatCurrency(savingsAcc.balance)}
                  </p>
                  <SparkAreaChart
                    className="w-full"
                    data={savingsBalance}
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
              {dataUpdatedAtExpenses
                ? `Updated ${format(dataUpdatedAtExpenses, 'HH:mm')}`
                : 'Fetching...'}
            </p>
          </div>
          <Separator className="mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <TabGroup
            className="xl:col-span-2"
            onIndexChange={(index) => setSelectedTab(index)}
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
                {mtdExpenses ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={mtdExpenses}
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
                {ytdExpenses ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={ytdExpenses}
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
                      Top Categories
                    </span>
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
                            <p className="text-subtle truncate">
                              {categoryName}
                            </p>
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
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex gap-0.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <span className="font-bold underline underline-offset-4 cursor-pointer">
                      Top Merchants
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto">
                    <p className="text-sm">
                      Merchants ordered by total expenditure
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1">
                {merchants
                  ? merchants.map(({ name, amount, absAmount }) => (
                      <div
                        key={name}
                        className="w-full flex h-8 items-center overflow-hidden"
                      >
                        <p className="flex-1 text-subtle truncate">{name}</p>
                        <span>{formatCurrencyAbsolute(absAmount, amount)}</span>
                      </div>
                    ))
                  : [...Array(4).keys()].map((i) => (
                      <Skeleton key={i} className="h-8" />
                    ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CumulativeSnapshot;
