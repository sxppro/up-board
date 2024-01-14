import { columns } from '@/app/(dashboard)/transactions/columns';
import { DataTable } from '@/app/(dashboard)/transactions/data-table';
import {
  getChildCategories,
  getTransactionsByDate,
  searchTransactions,
} from '@/db';
import { filterTransactionFields } from '@/utils/helpers';
import { subMonths } from 'date-fns';

interface TransactionTableProps {
  search?: string;
}

const TransactionTable = async ({ search }: TransactionTableProps) => {
  const now = new Date();
  const data = filterTransactionFields(
    search
      ? await searchTransactions(search)
      : await getTransactionsByDate(
          { from: subMonths(now, 1), to: now },
          { sort: 'time', sortDir: 'desc' }
        )
  );
  const categories = await getChildCategories();

  return (
    <DataTable
      columns={columns}
      data={data}
      options={categories}
      search={search}
    />
  );
};

export default TransactionTable;
