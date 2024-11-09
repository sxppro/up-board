'use client';

import { Button } from '@/components/ui/button';
import { Merchant } from '@/server/schemas';
import { cn } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export const columns: ColumnDef<Merchant>[] = [
  {
    accessorKey: 'icon',
    header: '',
    cell: (props) => {
      const { row } = props;
      const name = row.getValue<Merchant['name']>('name');
      const parentCategory = row.original.parentCategory;
      return (
        <span
          className={cn(
            'flex aspect-square size-12 items-center justify-center rounded-md p-2 font-normal text-white text-xl',
            `bg-up-${parentCategory}`
          )}
          aria-hidden="true"
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Merchant',
    cell: (props) => {
      const { row } = props;
      const name = row.getValue<Merchant['name']>('name');
      return (
        <Button
          variant="link"
          className={cn(
            'w-full h-full sm:min-w-[400px] lg:min-w-[480px] xl:min-w-[720px] px-0 justify-start text-lg sm:text-xl',
            focusRing
          )}
          asChild
        >
          <Link href={`/merchant/${encodeURIComponent(name)}`}>{name}</Link>
        </Button>
      );
    },
    filterFn: 'includesString',
  },
  {
    accessorKey: 'categoryName',
    header: 'Category',
    cell: (props) => {
      const { row } = props;
      const categoryName =
        row.getValue<Merchant['categoryName']>('categoryName');
      return <p className="sm:w-[160px] text-right">{categoryName}</p>;
    },
  },
];
