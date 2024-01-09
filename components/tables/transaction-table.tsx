import { columns } from '@/app/(dashboard)/transactions/columns';
import { DataTable } from '@/app/(dashboard)/transactions/data-table';
import { getChildCategories, getTransactionsByDate } from '@/db';
import { filterTransactionFields } from '@/utils/helpers';
import { subMonths } from 'date-fns';

const TransactionTable = async () => {
  const now = new Date();
  const data = filterTransactionFields(
    await getTransactionsByDate(
      { from: subMonths(now, 1), to: now },
      { sort: 'time', sortDir: 'desc' }
    )
  );
  const categories = await getChildCategories();

  return <DataTable columns={columns} data={data} options={categories} />;
};

export default TransactionTable;
