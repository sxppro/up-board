import IO from '@/components/charts/io';
import DateRangePicker from '@/components/core/date-range-picker';
import StatCard from '@/components/core/stat-card';
import DateProvider from '@/components/providers/date-provider';
import QueryProvider from '@/components/providers/query-provider';
import { getAccountById } from '@/db';
import { PageProps } from '@/types/custom';
import { getSearchParams } from '@/utils/helpers';
import { Col, Grid } from '@tremor/react';
import { X } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import AccountCharts from './charts';

type AccountPageProps = {
  params: { accountId: string };
} & PageProps;

export const metadata: Metadata = {
  title: 'Dashboard — Account Overview',
};

const AccountPage = async ({ params, searchParams }: AccountPageProps) => {
  const { accountId } = params;
  const { start, end } = searchParams;
  const [startDate, endDate] = getSearchParams(start, end);
  const accountInfo = await getAccountById(accountId);

  if (!accountInfo) {
    // Show 404 or other
    return (
      <div className="w-full flex h-[calc(100vh - 4rem)]">
        <div className="flex flex-col items-center gap-2 m-auto">
          <X className="h-8 w-8" />
          <h1 className="text-xl tracking-tight">No account info</h1>
        </div>
      </div>
    );
  }

  const { displayName } = accountInfo;

  return (
    <>
      <div className="w-full flex flex-col md:flex-row justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
        <DateRangePicker
          start={startDate ? new Date(startDate) : undefined}
          end={endDate ? new Date(endDate) : undefined}
        />
      </div>
      <div className="w-full flex flex-col mt-2 gap-6">
        <Grid numItemsMd={3} className="gap-4">
          <Suspense
            fallback={
              <Col numColSpanMd={3}>
                <StatCard info={{ title: 'Loading ...', isLoading: true }} />
              </Col>
            }
          >
            <IO
              accountId={accountId}
              start={startDate ? new Date(startDate) : undefined}
              end={endDate ? new Date(endDate) : undefined}
            />
          </Suspense>
        </Grid>
        <QueryProvider>
          <DateProvider
            start={startDate ? new Date(startDate) : undefined}
            end={endDate ? new Date(endDate) : undefined}
          >
            <AccountCharts accountId={accountId} />
          </DateProvider>
        </QueryProvider>
      </div>
    </>
  );
};

export default AccountPage;
