'use client';

import { DataTable } from '@/components/tables/data-table';
import { DataTablePagination } from '@/components/tables/data-table/pagination';
import { TransactionCategoryOption } from '@/server/schemas';
import { cn } from '@/utils/helpers';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  options: TransactionCategoryOption[];
  className?: string;
  search?: string;
}

export const TransactionsDataTable = <TData, TValue>({
  data,
  columns,
  options,
  className,
  search,
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
      columnFilters: [
        {
          id: 'description',
          value: search,
        },
      ],
    },
    state: {
      columnFilters,
      sorting,
    },
  });

  return (
    <div className={cn('w-full space-y-4', className)}>
      <DataTableToolbar table={table} options={options} />
      <DataTable table={table} />
      <DataTablePagination table={table} itemName="transaction" />
    </div>
  );
};
