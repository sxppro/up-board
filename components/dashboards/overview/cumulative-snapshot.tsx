'use client';

import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/helpers';
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
import {
  endOfMonth,
  format,
  startOfMonth,
  startOfYear,
  subYears,
} from 'date-fns';

interface CumulativeSnapshotProps {
  accountId: string;
  savAccountId: string;
}

const now = new Date();

const CumulativeSnapshot = ({
  accountId,
  savAccountId,
}: CumulativeSnapshotProps) => {
  const thisMonth = {
    from: startOfMonth(now),
    to: now,
  };
  const thisYear = {
    from: startOfYear(now),
    to: now,
  };
  const { data: mtdIncome, dataUpdatedAt: dataUpdatedAtIncome } =
    trpc.public.getCumulativeIO.useQuery({
      accountId,
      dateRange: thisMonth,
      compareDateRange: {
        from: subYears(thisMonth.from, 1),
        to: subYears(endOfMonth(now), 1),
      },
      type: 'income',
    });
  const { data: ytdIncome } = trpc.public.getCumulativeIO.useQuery({
    accountId,
    dateRange: thisYear,
    compareDateRange: {
      from: subYears(thisYear.from, 1),
      to: subYears(endOfMonth(now), 1),
    },
    type: 'income',
  });
  const { data: mtdExpenses, dataUpdatedAt: dataUpdatedAtExpenses } =
    trpc.public.getCumulativeIO.useQuery({
      accountId,
      dateRange: thisMonth,
      compareDateRange: {
        from: subYears(thisMonth.from, 1),
        to: subYears(endOfMonth(now), 1),
      },
      type: 'expense',
    });
  const { data: ytdExpenses } = trpc.public.getCumulativeIO.useQuery({
    accountId,
    dateRange: thisYear,
    compareDateRange: {
      from: subYears(thisYear.from, 1),
      to: subYears(endOfMonth(now), 1),
    },
    type: 'expense',
  });
  const { data: month } = trpc.public.getMonthlyInfo.useQuery({
    accountId,
    dateRange: thisMonth,
  });
  const { data: year } = trpc.public.getMonthlyInfo.useQuery({
    accountId,
    dateRange: thisYear,
  });
  const { data: transactionalBalance } = trpc.public.getAccountBalance.useQuery(
    {
      accountId,
      dateRange: thisMonth,
    }
  );
  const { data: savingsBalance } = trpc.public.getAccountBalance.useQuery({
    accountId: savAccountId,
    dateRange: thisMonth,
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
          <Separator className="my-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <TabGroup className="xl:col-span-2 ">
            <TabList className="space-x-0 items-center border-b">
              <Tab className="pl-4 pr-12 py-3 border-b-2 border-transparent">
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-muted-foreground">Month to date</p>
                  {month ? (
                    <p className="text-xl text-foreground h-8">
                      {formatCurrency(month[0]?.Income)}
                    </p>
                  ) : (
                    <Skeleton className="w-full h-8" />
                  )}
                </div>
              </Tab>
              <Separator orientation="vertical" className="h-[82px]" />
              <Tab className="pl-4 pr-12 py-3 border-b-2 border-transparent">
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-muted-foreground">Year to date</p>
                  {year ? (
                    <p className="text-xl text-foreground h-8">
                      {formatCurrency(year[0]?.Income)}
                    </p>
                  ) : (
                    <Skeleton className="w-full h-8" />
                  )}
                </div>
              </Tab>
              <Separator orientation="vertical" className="h-[82px]" />
            </TabList>
            <TabPanels>
              <TabPanel>
                {mtdIncome ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={mtdIncome}
                    index="FormattedDate"
                    categories={['AmountCumulative', 'AmountCumulativePast']}
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
                    categories={['AmountCumulative', 'AmountCumulativePast']}
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
          <div className="flex flex-col sm:p-4">
            <div className="flex-1 p-2">
              {' '}
              <p className="font-bold">Transaction account</p>{' '}
              {transactionalBalance ? (
                <>
                  <p className="text-2xl">
                    {formatCurrency(transactionalBalance.at(-1)?.Balance)}
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
            <Separator />
            <div className="flex-1 flex flex-col gap-1 p-2">
              <p className="font-bold">Savings</p>
              {savingsBalance ? (
                <>
                  <p className="text-2xl">
                    {formatCurrency(savingsBalance.at(-1)?.Balance)}
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
          <Separator className="my-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <TabGroup className="xl:col-span-2 ">
            <TabList className="space-x-0 items-center border-b">
              <Tab className="pl-4 pr-12 py-3 border-b-2 border-transparent">
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-muted-foreground">Month to date</p>
                  {month ? (
                    <p className="text-xl text-foreground h-8">
                      {formatCurrency(month[0]?.Expenses)}
                    </p>
                  ) : (
                    <Skeleton className="w-full h-8" />
                  )}
                </div>
              </Tab>
              <Separator orientation="vertical" className="h-[82px]" />
              <Tab className="pl-4 pr-12 py-3 border-b-2 border-transparent">
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-muted-foreground">Year to date</p>
                  {year ? (
                    <p className="text-xl text-foreground h-8">
                      {formatCurrency(year[0]?.Expenses)}
                    </p>
                  ) : (
                    <Skeleton className="w-full h-8" />
                  )}
                </div>
              </Tab>
              <Separator orientation="vertical" className="h-[82px]" />
            </TabList>
            <TabPanels>
              <TabPanel>
                {mtdExpenses ? (
                  <LineChart
                    className="h-64 sm:h-80"
                    data={mtdExpenses}
                    index="FormattedDate"
                    categories={['AmountCumulative', 'AmountCumulativePast']}
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
                    categories={['AmountCumulative', 'AmountCumulativePast']}
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
        </div>
      </section>
    </>
  );
};

export default CumulativeSnapshot;
