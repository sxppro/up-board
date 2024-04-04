import IO from '@/components/charts/io';
import DateRangePicker from '@/components/core/date-range-picker';
import { getAccountById } from '@/db';
import { PageProps } from '@/types/custom';
import { getSearchParams } from '@/utils/helpers';
import { Col, Grid } from '@tremor/react';
import { X } from 'lucide-react';
import { Metadata, ResolvingMetadata } from 'next';

type AccountPageProps = {
  params: { accountId: string };
} & PageProps;

export async function generateMetadata(
  { params }: AccountPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { accountId } = params;
  const accountInfo = await getAccountById(accountId);
  if (accountInfo) {
    const { displayName } = accountInfo;
    return { title: `Dashboard — ${displayName}` };
  } else {
    return { title: `Dashboard` };
  }
}

const AccountPage = async ({ params, searchParams }: AccountPageProps) => {
  const { accountId } = params;
  const { start, end } = searchParams;
  const [startDate, endDate] = getSearchParams(start, end);
  const accountInfo = await getAccountById(accountId);

  if (!accountInfo) {
    // Show 404 or other
    return (
      <div className="w-full flex h-screen">
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
      <div className="w-full mt-2">
        <Grid numItemsMd={3} className="gap-4">
          <IO
            accountId={accountId}
            start={startDate ? new Date(startDate) : undefined}
            end={endDate ? new Date(endDate) : undefined}
          />
        </Grid>
        <Grid numItemsMd={2} className="gap-4">
          <Col></Col>
          <Col></Col>
        </Grid>
      </div>
    </>
  );
};

export default AccountPage;
