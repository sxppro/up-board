import { getTransactionsByDate } from '@/utils/data';
import { endOfMonth, startOfMonth } from 'date-fns';
import { columns } from './columns';
import { DataTable } from './data-table';

const TransactionsPage = async () => {
  const now = new Date();
  const data = await getTransactionsByDate(startOfMonth(now), endOfMonth(now));

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
      <div className="w-full py-4">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
};

export default TransactionsPage;
