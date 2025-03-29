import TransactionPopover from '@/components/transaction-popover';
import { Button } from '@/components/ui/button';
import { TransactionResourceFiltered } from '@/server/schemas';
import { DotsThree } from '@phosphor-icons/react/dist/ssr';
import { Row } from '@tanstack/react-table';

interface DataTableRowActionsProps {
  row: Row<TransactionResourceFiltered>;
}

const DataTableRowActions = ({ row }: DataTableRowActionsProps) => {
  const transaction = row.original;

  return (
    <TransactionPopover id={transaction.id}>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Open menu</span>
        <DotsThree className="h-4 w-4" />
      </Button>
    </TransactionPopover>
  );
};

export default DataTableRowActions;
