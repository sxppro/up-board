import DateRangePicker from '@/components/core/date-range-picker';
import { getAccountById } from '@/db';
import { PageProps } from '@/types/custom';
import { getSearchParams } from '@/utils/helpers';
import { X } from 'lucide-react';

type AccountPageProps = {
  params: { accountId: string };
} & PageProps;

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
    </>
  );
};

export default AccountPage;
