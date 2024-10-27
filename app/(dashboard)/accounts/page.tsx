import { siteConfig } from '@/app/siteConfig';
import AccountsCarousel from '@/components/charts/accounts-carousel';
import { Separator } from '@/components/ui/separator';
import { getAccounts } from '@/db';
import { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Accounts`,
};

const AccountsPage = async () => {
  const accounts = await getAccounts(undefined, {
    // Order by transactional accounts first
    sort: { 'attributes.accountType': -1, 'attributes.displayName': 1 },
  });

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
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <section aria-labelledby="transactions" className="xl:col-span-2">
          <h1
            id="transactions"
            className="text-2xl font-semibold tracking-tight"
          >
            Transactions
          </h1>
          <Separator className="my-2" />
        </section>
      </div>
    </NuqsAdapter>
  );
};

export default AccountsPage;
