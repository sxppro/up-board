import AccountBalanceHistory from '@/components/charts/account-balance-history';
import CumulativeSnapshot from '@/components/dashboards/overview/cumulative';
import Summary from '@/components/dashboards/overview/summary';
import QueryProvider from '@/components/providers/query-provider';
import { getAccounts } from '@/db';
import { getDateRanges } from '@/utils/helpers';
import { Separator } from '@radix-ui/react-separator';
import { Metadata } from 'next';
import { siteConfig } from '../siteConfig';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Overview`,
};

const DashboardPage = async () => {
  const { last12months } = getDateRanges();
  const accounts = await getAccounts({
    match: { 'attributes.accountType': 'TRANSACTIONAL' },
    sort: {
      'attributes.balance.valueInBaseUnits': -1,
    },
    limit: 1,
  });

  return (
    <QueryProvider>
      <Summary />
      <CumulativeSnapshot accountId={accounts.at(0)?.id || ''} />
      <section aria-labelledby="overview-savings">
        <div>
          <h1
            id="overview-savings"
            className="text-2xl font-semibold tracking-tight"
          >
            Savings
          </h1>
          <Separator className="mt-2" />
        </div>
        <AccountBalanceHistory dateRange={last12months} accountType="SAVER" />
      </section>
    </QueryProvider>
  );
};

export default DashboardPage;
