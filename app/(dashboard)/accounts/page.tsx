import { siteConfig } from '@/app/siteConfig';
import AccountsCarousel from '@/components/charts/accounts-carousel';
import MonthlyInOut from '@/components/charts/monthly-in-out';
import QueryProvider from '@/components/providers/query-provider';
import TransactionsList from '@/components/tables/transactions-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getAccounts, getIOStats, getTransactionsByDay } from '@/db';
import { PageProps } from '@/types/custom';
import { now } from '@/utils/constants';
import { cn, formatCurrency } from '@/utils/helpers';
import {
  CurrencyDollar,
  HandCoins,
  PiggyBank,
} from '@phosphor-icons/react/dist/ssr';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Accounts`,
};

const AccountsPage = async ({ searchParams }: PageProps) => {
  const { id } = searchParams;
  const queryAccountId = Array.isArray(id) ? id[0] : id;
  const accounts = await getAccounts({
    // Order by transactional accounts first
    sort: { 'attributes.accountType': -1, 'attributes.displayName': 1 },
  });

  // Invalid account ID
  if (
    queryAccountId &&
    !accounts.find((account) => account.id === queryAccountId)
  ) {
    return redirect('/accounts');
  }

  const transactional = accounts.at(0);
  const accountId = queryAccountId || transactional?.id || '';
  const account = accounts.find((account) => account.id === accountId);
  const transactions = await getTransactionsByDay(
    {
      limit: 7,
    },
    undefined,
    accountId
  );
  const avgMonthStats = (
    await getIOStats(
      { groupBy: 'monthly' },
      {
        from: startOfMonth(subMonths(now, 13)),
        to: endOfMonth(subMonths(now, 1)),
      },
      accountId,
      true
    )
  ).at(0);

  return (
    <QueryProvider>
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
      <section
        aria-labelledby="categories-overview"
        className="flex flex-col gap-3"
      >
        <div>
          <h1
            id="categories-overview"
            className="text-2xl font-semibold tracking-tight"
          >
            Cashflow
          </h1>
          <Separator className="mt-2" />
        </div>
        <MonthlyInOut accountId={accountId} />
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <section aria-label="transactions" className="xl:col-span-2">
          <div className="flex flex-col gap-4">
            <TransactionsList transactions={transactions} />
          </div>
        </section>
        <section
          aria-label="transaction insights"
          className="row-start-1 sm:row-auto flex flex-col gap-3"
        >
          {avgMonthStats ? (
            <>
              <Alert className="border-none bg-indigo-50 dark:bg-indigo-950/70">
                <CurrencyDollar className="size-4" />
                <AlertTitle>Your monthly spend</AlertTitle>
                {account?.accountType === 'TRANSACTIONAL' ? (
                  <AlertDescription>
                    Over the previous 12 months, you spent an average of{' '}
                    <strong>{formatCurrency(avgMonthStats.Out)}</strong> per
                    month over{' '}
                    <strong>{Math.floor(avgMonthStats.Transactions)}</strong>{' '}
                    transactions.
                  </AlertDescription>
                ) : (
                  <AlertDescription>
                    Over the previous 12 months, you transferred{' '}
                    <strong>{formatCurrency(avgMonthStats.Out)}</strong> per
                    month out.
                  </AlertDescription>
                )}
              </Alert>
              <Alert className="border-none bg-lime-50 dark:bg-lime-950/70">
                <HandCoins className="size-4" />
                <AlertTitle>Your monthly income</AlertTitle>
                {account?.accountType === 'TRANSACTIONAL' ? (
                  <AlertDescription>
                    You earned an average of{' '}
                    <strong>{formatCurrency(avgMonthStats.In)}</strong> per
                    month. 🥳
                  </AlertDescription>
                ) : (
                  <AlertDescription>
                    You saved an average of{' '}
                    <strong>{formatCurrency(avgMonthStats.In)}</strong> per
                    month. 🥳
                  </AlertDescription>
                )}
              </Alert>
              <Alert
                className={cn(
                  'border-none transition-colors',
                  avgMonthStats.Net > 0
                    ? 'bg-green-50 dark:bg-green-950/70'
                    : 'bg-rose-50 dark:bg-rose-950/70'
                )}
              >
                <PiggyBank className="size-4" />
                <AlertTitle>Your net financial position</AlertTitle>
                {avgMonthStats.Net > 0 ? (
                  <AlertDescription>
                    That means on average you grew your savings by{' '}
                    <strong>{formatCurrency(avgMonthStats.Net)}</strong> per
                    month! 🎉
                  </AlertDescription>
                ) : (
                  <AlertDescription>
                    That means on average your savings shrank by{' '}
                    <strong>{formatCurrency(avgMonthStats.Net)}</strong> per
                    month. 😕
                  </AlertDescription>
                )}
              </Alert>
            </>
          ) : (
            ''
          )}
        </section>
      </div>
    </QueryProvider>
  );
};

export default AccountsPage;
