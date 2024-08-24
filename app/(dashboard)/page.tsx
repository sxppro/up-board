import ExpenseCategoriesStackedBar from '@/components/charts/expense-categories-stacked-bar';
import IOStats from '@/components/charts/io-stats';
import DashboardCard from '@/components/core/dashboard-card';
import StatCard from '@/components/core/stat-card';
import TableSkeleton from '@/components/core/table-skeleton';
import DateProvider from '@/components/providers/date-provider';
import QueryProvider from '@/components/providers/query-provider';
import AccountsList, {
  AccountsListLoading,
} from '@/components/tables/accounts-list';
import TransactionCard from '@/components/tables/transaction-card';
import { PageProps } from '@/types/custom';
import { getSearchParams } from '@/utils/helpers';
import { Col, Grid, Title } from '@tremor/react';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard — Overview',
};

const DashboardPage = ({ searchParams }: PageProps) => {
  const now = new Date();
  const { start, end } = searchParams;
  const [startDate, endDate] = getSearchParams(start, end);

  // Check date validity
  if (startDate || endDate) {
    if (startDate && endDate) {
      if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
        redirect('/');
      }
    } else {
      redirect('/');
    }
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
      <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-2">
        <Col>
          <div className="flex flex-col gap-3">
            <Suspense fallback={<AccountsListLoading />}>
              <AccountsList type="TRANSACTIONAL" colour="rose" />
            </Suspense>
            <Suspense
              fallback={
                <>
                  <AccountsListLoading />
                  <AccountsListLoading />
                </>
              }
            >
              <AccountsList type="SAVER" colour="teal" />
            </Suspense>
          </div>
        </Col>
        <Col numColSpanSm={2}>
          <div className="flex flex-col gap-3">
            <QueryProvider>
              <DateProvider
                start={startDate ? new Date(startDate) : startOfMonth(now)}
                end={endDate ? new Date(endDate) : now}
              >
                <Grid numItemsMd={3} className="gap-3">
                  <Suspense
                    fallback={
                      <>
                        <StatCard
                          info={{ title: 'Loading ...', isLoading: true }}
                        />
                        <StatCard
                          info={{ title: 'Loading ...', isLoading: true }}
                        />
                        <StatCard
                          info={{ title: 'Loading ...', isLoading: true }}
                        />
                      </>
                    }
                  >
                    <IOStats
                      accountId={process.env.UP_TRANS_ACC || ''}
                      start={
                        startDate ? new Date(startDate) : startOfMonth(now)
                      }
                      end={endDate ? new Date(endDate) : now}
                    />
                  </Suspense>
                </Grid>
                <ExpenseCategoriesStackedBar
                  start={subMonths(startOfMonth(subMonths(now, 1)), 5)}
                  end={endOfMonth(subMonths(now, 1))}
                />
                <Suspense
                  fallback={
                    <DashboardCard>
                      <Title>Recent Transactions</Title>
                      <TableSkeleton cols={2} rows={7} />
                    </DashboardCard>
                  }
                >
                  <TransactionCard
                    title="Recent Transactions"
                    options={{ transactionType: 'transactions' }}
                  />
                </Suspense>
              </DateProvider>
            </QueryProvider>
          </div>
        </Col>
      </Grid>
    </div>
  );
};

export default DashboardPage;
