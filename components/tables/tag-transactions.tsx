import { columns } from '@/app/(dashboard)/transactions/columns';
import { TransactionsDataTable } from '@/app/(dashboard)/transactions/data-table';
import { getCategories, getTransactionsByTag, searchTransactions } from '@/db';
import { filterTransactionFields } from '@/db/helpers';

interface TransactionsByTagProps {
  tag: string;
  search?: string;
}

const TransactionsByTag = async ({ tag, search }: TransactionsByTagProps) => {
  const data = await filterTransactionFields(
    search ? await searchTransactions(search) : await getTransactionsByTag(tag)
  );
  const categories = await getCategories('child');

  return (
    <TransactionsDataTable
      columns={columns}
      data={data}
      options={categories}
      search={search}
    />
  );
};

export default TransactionsByTag;
