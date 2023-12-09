import TableSkeleton from '@/components/TableSkeleton';
import TransactionsTable from '@/components/TransactionsTable';
import { Suspense } from 'react';

// Disable data cache for all dashboard pages
export const revalidate = 0;

const TransactionsPage = async () => {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
      <Suspense fallback={<TableSkeleton cols={4} rows={10} />}>
        <TransactionsTable />
      </Suspense>
    </>
  );
};

export default TransactionsPage;
