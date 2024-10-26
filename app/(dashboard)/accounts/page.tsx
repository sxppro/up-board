import { siteConfig } from '@/app/siteConfig';
import AccountsList, {
  AccountsListLoading,
} from '@/components/tables/accounts-list';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { getAccounts } from '@/db';
import { Card } from '@tremor/react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Accounts`,
};

const AccountsPage = async () => {
  const accounts = await getAccounts(undefined, {
    sort: { 'attributes.accountType': -1, 'attributes.displayName': 1 },
  });

  return (
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
      <Carousel className="w-full" opts={{ align: 'center' }}>
        <CarouselContent>
          {accounts.map((account) => (
            <CarouselItem
              key={account.id}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <div className="border rounded-tremor-default">
                <Card
                  decoration={'left'}
                  decorationColor={
                    account.accountType === 'TRANSACTIONAL' ? 'fuchsia' : 'lime'
                  }
                  className="ring-0 bg-background p-4"
                >
                  <p className="text-lg font-medium">{account.displayName}</p>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Separator className="my-2" />
      <Suspense fallback={<AccountsListLoading />}>
        <AccountsList type="TRANSACTIONAL" colour="rose" />
      </Suspense>
      <Suspense
        fallback={
          <>
            <AccountsListLoading />
            <AccountsListLoading />
          </>
        }
      >
        <AccountsList type="SAVER" colour="teal" />
      </Suspense>
    </section>
  );
};

export default AccountsPage;
