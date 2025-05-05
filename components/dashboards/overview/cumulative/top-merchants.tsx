'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Merchant } from '@/server/schemas';
import { cn, formatCurrencyAbsolute } from '@/utils/helpers';
import { Info } from '@phosphor-icons/react';
import Link from 'next/link';

interface TopMerchantsProps {
  merchants?: Merchant[];
}

const TopMerchants = ({ merchants }: TopMerchantsProps) => {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="flex gap-0.5">
        <span className="font-bold">Top Merchants</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-auto w-auto rounded-full p-1"
            >
              <Info />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <p className="text-sm">Merchants ordered by total expenditure</p>
          </PopoverContent>
        </Popover>
        {/* Only show button once finished loading */}
        {merchants ? (
          <Button variant="outline" className="h-6 px-2 shadow ml-auto">
            View more
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        {merchants
          ? merchants.map(({ name, amount, absAmount, parentCategory }) => (
              <div key={name} className="w-full flex h-8 items-center">
                <div className="flex flex-1 gap-2 overflow-hidden">
                  <div
                    className={cn(
                      'inline-block h-6 w-1 rounded-full',
                      parentCategory
                        ? `bg-up-${parentCategory}`
                        : 'bg-up-uncategorised'
                    )}
                  />
                  <Button
                    variant="link"
                    className="h-6 p-0 text-subtle text-base truncate underline"
                    asChild
                  >
                    <Link href={`/merchant/${encodeURIComponent(name)}`}>
                      {name}
                    </Link>
                  </Button>
                </div>
                <span>{formatCurrencyAbsolute(absAmount, amount)}</span>
              </div>
            ))
          : [...Array(4).keys()].map((i) => (
              <Skeleton key={i} className="h-8" />
            ))}
      </div>
    </div>
  );
};

export default TopMerchants;
