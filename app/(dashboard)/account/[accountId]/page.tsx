import { siteConfig } from '@/app/siteConfig';
import DateProvider from '@/components/providers/date-provider';
import QueryProvider from '@/components/providers/query-provider';
import { getAccountById } from '@/db';
import { PageProps } from '@/types/custom';
import { getSearchParams } from '@/utils/helpers';
import { startOfMonth } from 'date-fns';
import { X } from 'lucide-react';
import { Metadata } from 'next';
import AccountCharts from './charts';

type AccountPageProps = {
  params: { accountId: string };
} & PageProps;

export const metadata: Metadata = {
  title: `${siteConfig.name} — Account Overview`,
};

const AccountPage = async ({ params, searchParams }: AccountPageProps) => {
  const now = new Date();
  const { accountId } = params;
  const { start, end } = searchParams;
  const [startDate, endDate] = getSearchParams(start, end);
  const accountInfo = await getAccountById(accountId);

  if (!accountInfo) {
    return (
      <div className="w-full flex h-[calc(100vh_-_94px)]">
        <div className="flex flex-col items-center gap-2 m-auto">
          <X className="h-8 w-8" />
          <h1 className="text-xl tracking-tight">Account not found</h1>
        </div>
      </div>
    );
  }

  const { displayName, accountType } = accountInfo;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
      <div className="w-full flex flex-col mt-2 gap-6">
        <QueryProvider>
          <DateProvider
            start={startDate ? new Date(startDate) : startOfMonth(now)}
            end={endDate ? new Date(endDate) : now}
          >
            <AccountCharts
              accountId={accountId}
              accountType={accountType}
              start={startDate ? new Date(startDate) : undefined}
              end={endDate ? new Date(endDate) : undefined}
            />
          </DateProvider>
        </QueryProvider>
      </div>
    </>
  );
};

export default AccountPage;
