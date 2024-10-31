import { columns } from '@/app/(dashboard)/transactions/columns';
import { DataTable } from '@/app/(dashboard)/transactions/data-table';
import { getCategories, getTransactionsByDate, searchTransactions } from '@/db';
import { filterTransactionFields } from '@/db/helpers';
import { subMonths } from 'date-fns';

interface TransactionTableProps {
  search?: string;
}

const TransactionTable = async ({ search }: TransactionTableProps) => {
  const now = new Date();
  const data = await filterTransactionFields(
    search
      ? await searchTransactions(search)
      : await getTransactionsByDate(
          {
            account: 'transactional',
            transactionType: 'transactions',
            dateRange: { from: subMonths(now, 1), to: now },
            sort: 'time',
            sortDir: 'desc',
          },
          ''
        )
  );
  const categories = await getCategories('child');

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
