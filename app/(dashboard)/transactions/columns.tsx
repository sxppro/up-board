'use client';

import { FilteredTransactionResource } from '@/types/custom';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<FilteredTransactionResource>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'time',
    header: 'Time',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
];
