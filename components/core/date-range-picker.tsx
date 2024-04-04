'use client';

import {
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/helpers';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

enum DatePickerPresets {
  TODAY = 'today',
  THIS_WEEK = 'thisWeek',
  THIS_MONTH = 'thisMonth',
  THIS_YEAR = 'thisYear',
}

interface DateRangePicker extends React.HTMLAttributes<HTMLDivElement> {
  start?: Date;
  end?: Date;
}

export default function DateRangePicker({
  className,
  start,
  end,
}: DateRangePicker) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: start,
    to: end,
  });
  const router = useRouter();
  const { replace } = router;
  const currentPath = usePathname();

  const changeDateRange = (selection: DatePickerPresets) => {
    const date = new Date();
    if (selection === DatePickerPresets.TODAY) {
      setDate({ from: startOfDay(date), to: endOfDay(date) });
    } else if (selection === DatePickerPresets.THIS_WEEK) {
      setDate({ from: startOfWeek(date), to: date });
    } else if (selection === DatePickerPresets.THIS_MONTH) {
      setDate({ from: startOfMonth(date), to: date });
    } else if (selection === DatePickerPresets.THIS_YEAR) {
      setDate({ from: startOfYear(date), to: date });
    }
  };

  useEffect(() => {
    date?.from &&
      date.to &&
      replace(
        `${currentPath}?${new URLSearchParams({
          start: date?.from.toISOString(),
          end: date?.to.toISOString(),
        })}`
      );
  }, [date, currentPath, replace]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'md:w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex flex-col w-auto space-y-2 p-2"
          align="start"
        >
          <Select
            onValueChange={(selection: DatePickerPresets) =>
              changeDateRange(selection)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick a date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DatePickerPresets.TODAY}>Today</SelectItem>
              <SelectItem value={DatePickerPresets.THIS_WEEK}>
                This week
              </SelectItem>
              <SelectItem value={DatePickerPresets.THIS_MONTH}>
                This month
              </SelectItem>
              <SelectItem value={DatePickerPresets.THIS_YEAR}>
                This year
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="rounded-md border">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              // If selecting a single day, set 'to' to end of the day
              onSelect={(dateRange) =>
                dateRange && dateRange.from && !dateRange.to
                  ? setDate({ ...dateRange, to: endOfDay(dateRange?.from) })
                  : setDate(dateRange)
              }
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
