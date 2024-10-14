import { siteConfig } from '@/app/siteConfig';
import TableSkeleton from '@/components/core/table-skeleton';
import QueryProvider from '@/components/providers/query-provider';
import TransactionTable from '@/components/tables/transaction-table';
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
      <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
      <Suspense fallback={<TableSkeleton cols={4} rows={10} />}>
        <TransactionTable search={searchTerm} />
      </Suspense>
    </QueryProvider>
  );
};

export default TransactionsPage;
