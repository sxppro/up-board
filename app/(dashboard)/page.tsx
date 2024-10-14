import Summary from '@/components/dashboards/overview/summary';
import QueryProvider from '@/components/providers/query-provider';
import { Separator } from '@/components/ui/separator';
import { Metadata } from 'next';
import { siteConfig } from '../siteConfig';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Overview`,
};

const DashboardPage = () => {
  return (
    <QueryProvider>
      <Summary />
      <section aria-labelledby="overview-income">
        <div>
          <h1
            id="overview-income"
            className="text-2xl font-semibold tracking-tight"
          >
            Income
          </h1>
          <Separator className="my-2" />
        </div>
      </section>
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
