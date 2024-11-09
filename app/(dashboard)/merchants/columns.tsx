'use client';

import { Merchant } from '@/server/schemas';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Merchant>[] = [
  {
    accessorKey: 'name',
    header: '',
  },
  {
    accessorKey: 'name',
    header: 'Merchant',
  },
  {
    accessorKey: 'categoryName',
    header: 'Category',
  },
];
