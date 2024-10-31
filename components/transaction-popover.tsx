'use client';

import { PropsWithChildren } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

interface TransactionPopoverProps extends PropsWithChildren {
  id: string;
}

const TransactionPopover = ({ children, id }: TransactionPopoverProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Transaction</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default TransactionPopover;
