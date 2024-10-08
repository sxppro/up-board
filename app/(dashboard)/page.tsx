import ExpenseCategoriesStackedBar from '@/components/charts/expense-categories-stacked-bar';
import DashboardCard from '@/components/core/dashboard-card';
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
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <Grid numItemsSm={2} numItemsLg={3} className="gap-6 mt-2">
        <Col numColSpanSm={2} numColSpanLg={1}>
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
          <Grid className="gap-3" numItemsMd={2}>
            <QueryProvider>
              <DateProvider
                start={startDate ? new Date(startDate) : startOfMonth(now)}
                end={endDate ? new Date(endDate) : now}
              >
                <Col numColSpan={2}>
                  <ExpenseCategoriesStackedBar
                    start={subMonths(startOfMonth(subMonths(now, 1)), 5)}
                    end={endOfMonth(subMonths(now, 1))}
                  />
                </Col>
                <Col numColSpan={2} numColSpanMd={1}>
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
                </Col>
                <Col numColSpan={2} numColSpanMd={1}>
                  <Suspense
                    fallback={
                      <DashboardCard>
                        <Title>Recent Transfers</Title>
                        <TableSkeleton cols={2} rows={7} />
                      </DashboardCard>
                    }
                  >
                    <TransactionCard
                      title="Recent Transfers"
                      options={{ transactionType: 'transfers' }}
                    />
                  </Suspense>
                </Col>
              </DateProvider>
            </QueryProvider>
          </Grid>
        </Col>
      </Grid>
    </div>
  );
};

export default DashboardPage;
