import { getTransactionsByDate } from '@/utils/data';
import { endOfMonth, startOfMonth } from 'date-fns';
import { columns } from './columns';
import { DataTable } from './data-table';

// Disable data cache for all dashboard pages
export const revalidate = 0;

const TransactionsPage = async () => {
  const now = new Date();
  const data = await getTransactionsByDate(startOfMonth(now), endOfMonth(now));

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
      <DataTable className="py-4" columns={columns} data={data} />
    </>
  );
};

export default TransactionsPage;
