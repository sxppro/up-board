import TableSkeleton from '@/components/TableSkeleton';
import TransactionTable from '@/components/tables/transaction-table';
import { PageProps } from '@/types/custom';
import { Suspense } from 'react';

// Disable data cache for transactions page
export const revalidate = 0;

const TransactionsPage = async ({ searchParams }: PageProps) => {
  const { search } = searchParams;
  const searchTerm = Array.isArray(search) ? search[0] : search;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
      <Suspense fallback={<TableSkeleton cols={4} rows={10} />}>
        <TransactionTable search={searchTerm} />
      </Suspense>
    </>
  );
};

export default TransactionsPage;
