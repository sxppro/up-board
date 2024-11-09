'use client';

import { DataTable } from '@/components/tables/data-table';
import { DataTablePagination } from '@/components/tables/data-table/pagination';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const MerchantsDataTable = <TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });
  return (
    <div>
      <DataTable table={table} header={false} className={{ cell: 'px-2' }} />
      <DataTablePagination table={table} />
    </div>
  );
};

export default MerchantsDataTable;
