import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex flex-1 items-center space-x-2 w-full">
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
        {table.getColumn('category') && (
          <DataTableFacetedFilter
            column={table.getColumn('category')}
            title="Category"
            options={[{ value: 'uncategorised', label: 'Uncategorised' }]}
          />
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
