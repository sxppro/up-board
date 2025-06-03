'use client';

import ScrollableContent from '@/components/core/scrollable-content';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { BarList, BarListProps } from '@/components/ui/tremor/bar-list';
import { cn, formatCurrency } from '@/utils/helpers';
import { CircleNotch } from '@phosphor-icons/react';
import { Text, Title } from '@tremor/react';
import { useState } from 'react';

interface TopItemsBarProps extends Pick<BarListProps, 'data'> {
  title: string;
  description: string;
  className?: string;
}

const TopItemsBar = ({
  className,
  data,
  description,
  title,
}: TopItemsBarProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section
      aria-label={description}
      className={cn(
        'relative h-full border rounded-tremor-default flex flex-col gap-4 p-4',
        className
      )}
    >
      <div>
        <Title>{title}</Title>
        <Text>{description}</Text>
      </div>
      {data ? (
        <BarList
          data={data.slice(0, 6)}
          valueFormatter={(number: number) => formatCurrency(number)}
          showAnimation
        />
      ) : (
        <Skeleton className="w-full h-56" />
      )}
      {data && data.length > 6 && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center rounded-b-tremor-default bg-gradient-to-t from-tremor-background to-transparent py-7 dark:from-dark-tremor-background">
          <Button
            className="h-8"
            onClick={() => setIsDialogOpen(!isDialogOpen)}
          >
            View more
          </Button>
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ScrollableContent className="h-96">
            {data ? (
              <BarList
                data={data}
                valueFormatter={(number: number) => formatCurrency(number)}
                showAnimation
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <CircleNotch className="size-8 animate-spin" />
                <p className="text-lg tracking-tight">Loading data</p>
              </div>
            )}
          </ScrollableContent>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Go back</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TopItemsBar;
