import { siteConfig } from '@/app/siteConfig';
import AccountsCarousel from '@/components/charts/accounts-carousel';
import { Separator } from '@/components/ui/separator';
import { getAccounts, getTransactionsByDay } from '@/db';
import { PageProps } from '@/types/custom';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Accounts`,
};

const AccountsPage = async ({ searchParams }: PageProps) => {
  const { id } = searchParams;
  const accountId = Array.isArray(id) ? id[0] : id;
  const accounts = await getAccounts(undefined, {
    // Order by transactional accounts first
    sort: { 'attributes.accountType': -1, 'attributes.displayName': 1 },
  });
  const transactional = accounts.at(0);
  const transactions = await getTransactionsByDay(
    accountId || transactional?.id || '',
    undefined,
    { limit: 14 }
  );

  return (
    <NuqsAdapter>
      <section
        aria-labelledby="accounts-overview"
        className="flex flex-col gap-3"
      >
        <div>
          <h1
            id="accounts-overview"
            className="text-2xl font-semibold tracking-tight"
          >
            Accounts
          </h1>
          <Separator className="mt-2" />
        </div>
        <AccountsCarousel accounts={accounts} />
        <Separator className="mb-2" />
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <section aria-label="transactions" className="xl:col-span-2">
          <div className="flex flex-col gap-4">
            {transactions.map(({ timestamp, transactions }) => (
              <div key={timestamp.toISOString()}>
                <p className="text-lg font-bold">{formatDate(timestamp)}</p>
                <Separator className="my-1" />
                {transactions.map(({ id, attributes }) => (
                  <div
                    key={id}
                    className="w-full flex py-1 items-center overflow-hidden"
                  >
                    <p className="flex-1 text-subtle truncate">
                      {attributes.description}
                    </p>
                    <span>
                      {formatCurrency(attributes.amount.valueInBaseUnits / 100)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section aria-labelledby="transaction-insights">
          <h1
            id="transaction-insights"
            className="text-2xl font-semibold tracking-tight"
          >
            Insights
          </h1>
          <Separator className="my-2" />
        </section>
      </div>
    </NuqsAdapter>
  );
};

export default AccountsPage;
