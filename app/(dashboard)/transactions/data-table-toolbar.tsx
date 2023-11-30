import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          className="h-8 md:w-[250px]"
          placeholder="Filter transactions ..."
          value={
            (table.getColumn('description')?.getFilterValue() as string) ?? ''
          }
          onChange={(e) =>
            table.getColumn('description')?.setFilterValue(e.target.value)
          }
        />
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
