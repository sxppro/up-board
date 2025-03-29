'use client';

/**
 * Date range select with
 * query param state
 */

import { DateRangePresets } from '@/types/custom';
import { cn } from '@/utils/helpers';
import { useDateRange } from '@/utils/hooks';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function DateRangeSelect({ className }: { className?: string }) {
  const { range, setRange } = useDateRange();

  const onValueChange = (value: string) => setRange(value);

  return (
    <Select
      defaultValue={range || DateRangePresets.MONTH}
      onValueChange={(selection) => onValueChange(selection)}
    >
      <SelectTrigger
        className={cn('py-0 px-2 sm:py-2 sm:px-3 w-[180px]', className)}
      >
        <SelectValue placeholder="Last 30 days" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={DateRangePresets.TODAY}>Last 24 hours</SelectItem>
          <SelectItem value={DateRangePresets.WEEK}>Last 7 days</SelectItem>
          <SelectItem value={DateRangePresets.MONTH}>Last 30 days</SelectItem>
          <SelectItem value={DateRangePresets.THREE_MONTHS}>
            Last 3 months
          </SelectItem>
          <SelectItem value={DateRangePresets.SIX_MONTHS}>
            Last 6 months
          </SelectItem>
          <SelectItem value={DateRangePresets.YEAR}>Last 12 months</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
