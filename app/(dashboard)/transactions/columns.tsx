'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TransactionResourceFiltered } from '@/server/schemas';
import { formatCurrency, formatDateWithTime } from '@/utils/helpers';
import { Note, Paperclip, Tag } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import DataTableRowActions from './data-table-row-actions';

export const columns: ColumnDef<TransactionResourceFiltered>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="link"
          className="h-6 p-0 gap-1 truncate font-medium flex-start"
          asChild
        >
          <Link
            href={`/merchant/${encodeURIComponent(
              row.getValue('description')
            )}`}
          >
            {row.getValue('description')}
            {row.original.tags.length > 0 && (
              <Tag className="size-4 fill-fuchsia-600" />
            )}
            {row.original.note && <Note className="size-4 fill-lime-600" />}
            {row.original.attachment && (
              <Paperclip className="size-4 fill-rose-600" />
            )}
          </Link>
        </Button>
      </div>
    ),
    filterFn: () => true,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <div className="flex justify-end">
        <Button
          className="-ml-2 px-2 py-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="size-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = formatCurrency(amount);
      return (
        <div className="float-right text-nowrap text-end font-medium">
          {formatted}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = parseFloat(rowA.original.amount);
      const b = parseFloat(rowB.original.amount);
      return a > b ? 1 : a < b ? -1 : 0;
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <div className="w-[150px] truncate">{row.getValue('category')}</div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'time',
    header: ({ column, header }) => (
      <Button
        className="-ml-2 px-2 py-1"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Time
        <ArrowUpDown className="size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const time = Date.parse(row.getValue('time'));
      if (isNaN(time)) return '—';
      return (
        <div className="text-nowrap">
          {formatDateWithTime(row.getValue('time'))}
        </div>
      );
    },
    sortingFn: 'datetime',
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
