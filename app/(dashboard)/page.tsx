import CumulativeSnapshot from '@/components/dashboards/overview/cumulative-snapshot';
import Summary from '@/components/dashboards/overview/summary';
import QueryProvider from '@/components/providers/query-provider';
import { getAccounts } from '@/db';
import { Metadata } from 'next';
import { siteConfig } from '../siteConfig';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Overview`,
};

const DashboardPage = async () => {
  const accounts = await getAccounts('TRANSACTIONAL');
  const savAccounts = await getAccounts('SAVER');

  return (
    <QueryProvider>
      <Summary accountId={accounts.at(0)?.id || ''} />
      <CumulativeSnapshot
        accountId={accounts.at(0)?.id || ''}
        savAccountId={savAccounts.at(0)?.id || ''}
      />
    </QueryProvider>
  );
};

export default DashboardPage;
