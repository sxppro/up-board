import { siteConfig } from '@/app/siteConfig';
import TableSkeleton from '@/components/core/table-skeleton';
import QueryProvider from '@/components/providers/query-provider';
import TransactionTable from '@/components/tables/transaction-table';
import { Separator } from '@/components/ui/separator';
import { PageProps } from '@/types/custom';
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
          <TransactionTable search={searchTerm} />
        </Suspense>
      </section>
    </QueryProvider>
  );
};

export default TransactionsPage;
