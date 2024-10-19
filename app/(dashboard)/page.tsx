import CumulativeSnapshot from '@/components/dashboards/overview/cumulative-snapshot';
import Summary from '@/components/dashboards/overview/summary';
import QueryProvider from '@/components/providers/query-provider';
import { Separator } from '@/components/ui/separator';
import { getAccounts } from '@/db';
import { Metadata } from 'next';
import { siteConfig } from '../siteConfig';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Overview`,
};

const DashboardPage = async () => {
  const accounts = await getAccounts('TRANSACTIONAL');

  return (
    <QueryProvider>
      <Summary accountId={accounts.at(0)?.id || ''} />
      <CumulativeSnapshot accountId={accounts.at(0)?.id || ''} />
      <section aria-labelledby="overview-expenses">
        <div>
          <div className="flex items-center justify-between">
            <h1
              id="overview-expenses"
              className="text-2xl font-semibold tracking-tight"
            >
              Expenses
            </h1>
            <p className="text-sm text-muted dark:text-muted-foreground">
              Updated today 18:30
            </p>
          </div>
          <Separator className="my-2" />
        </div>
      </section>
    </QueryProvider>
  );
};

export default DashboardPage;
