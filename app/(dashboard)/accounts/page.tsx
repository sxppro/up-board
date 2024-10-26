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
          <Separator className="my-2" />
        </div>
        <AccountsCarousel accounts={accounts} />
        <Separator className="my-2" />
      </section>
    </NuqsAdapter>
  );
};

export default AccountsPage;
