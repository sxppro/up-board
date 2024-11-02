'use client';

/**
 * Date range select with
 * query param state
 */

import { DateRangePresets } from '@/types/custom';
import { useQueryState } from 'nuqs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function DateRangeSelect({ selected }: { selected?: string }) {
  const [_, setDateRange] = useQueryState('range', {
    defaultValue: DateRangePresets.MONTH,
    shallow: false,
  });

  const onValueChange = (value: string) => {
    if (value === DateRangePresets.TODAY) {
      setDateRange(DateRangePresets.TODAY);
    } else if (value === DateRangePresets.WEEK) {
      setDateRange(DateRangePresets.WEEK);
    } else if (value === DateRangePresets.MONTH) {
      setDateRange(DateRangePresets.MONTH);
    } else if (value === DateRangePresets.THREE_MONTHS) {
      setDateRange(DateRangePresets.THREE_MONTHS);
    } else if (value === DateRangePresets.SIX_MONTHS) {
      setDateRange(DateRangePresets.SIX_MONTHS);
    } else if (value === DateRangePresets.YEAR) {
      setDateRange(DateRangePresets.YEAR);
    }
  };
  return (
    <Select
      defaultValue="30d"
      value={selected}
      onValueChange={(selection) => onValueChange(selection)}
    >
      <SelectTrigger className="py-0 px-2 sm:py-2 sm:px-3 w-[180px]">
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
