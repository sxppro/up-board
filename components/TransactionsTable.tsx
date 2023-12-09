import { columns } from '@/app/(dashboard)/transactions/columns';
import { DataTable } from '@/app/(dashboard)/transactions/data-table';
import { getTransactionsByDate } from '@/utils/server';
import { subMonths } from 'date-fns';

const TransactionsTable = async () => {
  const now = new Date();
  const data = await getTransactionsByDate(subMonths(now, 1), now);

  return <DataTable columns={columns} data={data} />;
};

export default TransactionsTable;
