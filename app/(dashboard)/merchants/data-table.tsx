'use client';

import { DataTable } from '@/components/tables/data-table';
import { DataTablePagination } from '@/components/tables/data-table/pagination';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { MagnifyingGlass } from '@phosphor-icons/react';
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const MerchantsDataTable = <TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    state: {
      columnFilters,
    },
  });
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1
          id="accounts-overview"
          className="text-2xl font-semibold tracking-tight"
        >
          Merchants
        </h1>
        <div className="w-full sm:max-w-[240px] relative">
          <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2">
            <MagnifyingGlass size={16} className="text-muted-foreground" />
          </div>
          <Input
            className="h-8 pl-7 focus-visible:ring-0"
            type="search"
            placeholder="Find merchant"
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) =>
              table.getColumn('name')?.setFilterValue(e.target.value)
            }
          />
        </div>
      </div>
      <Separator className="mt-2" />
      <DataTable table={table} header={false} className={{ cell: 'px-2' }} />
      <DataTablePagination table={table} itemName="merchant" />
    </div>
  );
};

export default MerchantsDataTable;
