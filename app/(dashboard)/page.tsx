import IO from '@/components/charts/io';
import DashboardCard from '@/components/core/dashboard-card';
import DateRangePicker from '@/components/core/date-range-picker';
import StatCard from '@/components/core/stat-card';
import TableSkeleton from '@/components/core/table-skeleton';
import DateProvider from '@/components/providers/date-provider';
import AccountsList, {
  AccountsListLoading,
} from '@/components/tables/accounts-list';
import TransactionCard from '@/components/tables/transaction-card';
import { PageProps } from '@/types/custom';
import { getSearchParams } from '@/utils/helpers';
import { Col, Grid, Title } from '@tremor/react';
import { startOfMonth } from 'date-fns';
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
    <>
      <div className="w-full flex flex-col md:flex-row justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <DateRangePicker
          start={startDate ? new Date(startDate) : undefined}
          end={endDate ? new Date(endDate) : undefined}
        />
      </div>
      <div className="w-full">
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
              <DateProvider
                start={startDate ? new Date(startDate) : startOfMonth(now)}
                end={endDate ? new Date(endDate) : now}
              >
                <Grid numItemsMd={3} className="gap-3">
                  <Suspense
                    fallback={
                      <Col numColSpanMd={3}>
                        <StatCard
                          info={{ title: 'Loading ...', isLoading: true }}
                        />
                      </Col>
                    }
                  >
                    <IO
                      accountId={process.env.UP_TRANS_ACC || ''}
                      start={
                        startDate ? new Date(startDate) : startOfMonth(now)
                      }
                      end={endDate ? new Date(endDate) : now}
                    />
                  </Suspense>
                </Grid>
                <Suspense
                  fallback={
                    <DashboardCard>
                      <Title>test</Title>
                      <TableSkeleton cols={2} rows={7} />
                    </DashboardCard>
                  }
                >
                  <TransactionCard
                    title="test"
                    options={{ type: 'transactions' }}
                  />
                </Suspense>
              </DateProvider>
            </div>
          </Col>
        </Grid>
      </div>
    </>
  );
};

export default DashboardPage;
