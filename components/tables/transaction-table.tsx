import { columns } from '@/app/(dashboard)/transactions/columns';
import { TransactionsDataTable } from '@/app/(dashboard)/transactions/data-table';
import { getCategories, searchTransactions } from '@/db';
import { filterTransactionFields } from '@/db/helpers';
import { SerialisedDbTransactionResource } from '@/types/custom';

interface TransactionTableProps {
  className?: string;
  search?: string;
  transactions: SerialisedDbTransactionResource[];
}

const TransactionTable = async ({
  className,
  search,
  transactions,
}: TransactionTableProps) => {
  const data = await filterTransactionFields(
    search ? await searchTransactions(search) : transactions
  );
  const categories = await getCategories('child');

  return (
    <TransactionsDataTable
      className={className}
      columns={columns}
      data={data}
      options={categories}
      search={search}
    />
  );
};

export default TransactionTable;
