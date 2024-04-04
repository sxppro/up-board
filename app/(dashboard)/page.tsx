import DashboardCard from '@/components/core/dashboard-card';
import DateRangePicker from '@/components/core/date-range-picker';
import TableSkeleton from '@/components/core/table-skeleton';
import AccountsList from '@/components/tables/accounts-list';
import TransactionCard from '@/components/tables/transaction-card';
import { PageProps } from '@/types/custom';
import { Col, Grid, Title } from '@tremor/react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard — Overview',
};

const DashboardPage = ({ searchParams }: PageProps) => {
  const { start, end } = searchParams;
  const startDate = Array.isArray(start) ? start[0] : start;
  const endDate = Array.isArray(end) ? end[0] : end;

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
            <div className="flex flex-col gap-4">
              <AccountsList type="TRANSACTIONAL" colour="rose" />
              <AccountsList type="SAVER" colour="teal" />
            </div>
          </Col>
          <Col>
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
          </Col>
        </Grid>
      </div>
    </>
  );
};

export default DashboardPage;
