'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FilteredTransactionResource } from '@/types/custom';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { enAU } from 'date-fns/locale';
import { ArrowUpDown } from 'lucide-react';
import DataTableRowActions from './data-table-row-actions';

export const columns: ColumnDef<FilteredTransactionResource>[] = [
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
    accessorKey: 'time',
    header: ({ column, header }) => {
      return (
        <Button
          className="-ml-4"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const time = Date.parse(row.getValue('time'));
      if (isNaN(time)) return '—';
      /**
       * Defaulting to Australian date format
       * (unless you can find a way to detect locale server-side)
       */
      const formattedTime = new Intl.DateTimeFormat('en-AU', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Australia/Melbourne',
      }).format(time);
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-[100px]">
                {formatDistanceToNow(time, {
                  addSuffix: true,
                  includeSeconds: true,
                  locale: enAU,
                }).replace(/^about /, '')}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{formattedTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Badge variant="outline">{row.original.status}</Badge>
        <div className="sm:w-[300px] md:w-[400px] lg:w-[500px] max-w-[500px] truncate font-medium">
          {row.getValue('description')}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => (
      <div className="flex flex-wrap sm:w-[150px] gap-2">
        {(row.getValue('tags') as string[]).map((tag) => (
          // TODO: Truncated tags look kinda funky
          <Badge className="truncate" key={tag}>
            {tag}
          </Badge>
        ))}
      </div>
    ),
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
    accessorKey: 'amount',
    header: () => <div className="text-end">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
      }).format(amount);
      return (
        <div className="w-[100px] float-right text-end font-medium">
          {formatted}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
