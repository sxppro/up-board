'use client';

import ExpenseCategoriesCategoryBar from '@/components/charts/expense-categories-category-bar';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { subDays, subMonths, subYears } from 'date-fns';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

const Summary = () => {
  const now = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(now, 30),
    to: now,
  });

  const onValueChange = (value: string) => {
    if (value === '24h') {
      setDate({ from: subDays(now, 1), to: now });
    } else if (value === '7d') {
      setDate({ from: subDays(now, 7), to: now });
    } else if (value === '30d') {
      setDate({ from: subDays(now, 30), to: now });
    } else if (value === '3m') {
      setDate({ from: subMonths(now, 3), to: now });
    } else if (value === '6m') {
      setDate({ from: subMonths(now, 6), to: now });
    } else if (value === '12m') {
      setDate({ from: subYears(now, 1), to: now });
    }
  };

  return (
    <section
      aria-labelledby="overview-summary"
      className="flex flex-col gap-4 sm:gap-8 lg:gap-10"
    >
      <div>
        <div className="flex items-center justify-between">
          <h1
            id="overview-summary"
            className="text-2xl font-semibold tracking-tight"
          >
            Summary
          </h1>
          <Select
            defaultValue="30d"
            onValueChange={(selection) => onValueChange(selection)}
          >
            <SelectTrigger className="py-0 px-2 sm:py-2 sm:px-3 w-[180px]">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Separator className="my-2" />
      </div>
      <div className="grid grid-cols-1 gap-14 sm:grid-cols-2">
        <ExpenseCategoriesCategoryBar start={date?.from} end={date?.to} />
      </div>
    </section>
  );
};

export default Summary;
