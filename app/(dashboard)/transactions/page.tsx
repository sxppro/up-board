import { siteConfig } from '@/app/siteConfig';
import TableSkeleton from '@/components/core/table-skeleton';
import QueryProvider from '@/components/providers/query-provider';
import TransactionTable from '@/components/tables/transaction-table';
import { Separator } from '@/components/ui/separator';
import { getTransactionsByDate } from '@/db';
import { PageProps } from '@/types/custom';
import { getDateRanges } from '@/utils/helpers';
import { startOfMonth } from 'date-fns';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Transactions`,
};

// Disable data cache for transactions page
export const revalidate = 0;

const TransactionsPage = async ({ searchParams }: PageProps) => {
  const { search } = searchParams;
  const searchTerm = Array.isArray(search) ? search[0] : search;
  const { last3months } = getDateRanges();
  const transactions = await getTransactionsByDate({
    account: 'transactional',
    transactionType: 'transactions',
    dateRange: { from: startOfMonth(last3months.from), to: last3months.to },
    sort: 'time',
    sortDir: 'desc',
  });

  return (
    <QueryProvider>
      <section
        aria-labelledby="categories-overview"
        className="flex flex-col gap-3"
      >
        <div>
          <h1
            id="categories-overview"
            className="text-2xl font-semibold tracking-tight"
          >
            Transactions
          </h1>
          <Separator className="mt-2" />
        </div>
        <Suspense fallback={<TableSkeleton cols={1} rows={10} />}>
          <TransactionTable transactions={transactions} search={searchTerm} />
        </Suspense>
      </section>
    </QueryProvider>
  );
};

export default TransactionsPage;
