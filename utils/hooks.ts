import { CarouselApi, EmblaCarouselType } from '@/components/ui/carousel';
import { DateRangePresets } from '@/types/custom';
import { now } from '@/utils/constants';
import { subDays, subMonths, subYears } from 'date-fns';
import { useQueryState } from 'nuqs';
import { useCallback, useContext, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { DateContext } from './contexts';

type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within DateProvider');
  }
  return context;
};

/**
 * ! Depends on <NuqsAdapter> context
 */
export const useDateRange = (defaultPreset = DateRangePresets.MONTH) => {
  const [range, setRange] = useQueryState('range', {
    defaultValue: defaultPreset,
    shallow: false,
  });

  const getDateRangeFromPreset = (range: string): DateRange => {
    switch (range) {
      case DateRangePresets.TODAY:
        return { from: subDays(now, 1), to: now };
      case DateRangePresets.WEEK:
        return { from: subDays(now, 7), to: now };
      case DateRangePresets.MONTH:
        return { from: subDays(now, 30), to: now };
      case DateRangePresets.THREE_MONTHS:
        return { from: subMonths(now, 3), to: now };
      case DateRangePresets.SIX_MONTHS:
        return { from: subMonths(now, 6), to: now };
      case DateRangePresets.YEAR:
        return { from: subYears(now, 1), to: now };
      default:
        setRange(DateRangePresets.MONTH);
        return { from: subDays(now, 30), to: now };
    }
  };

  return {
    range,
    setRange,
    dateRange: getDateRangeFromPreset(range),
    getDateRangeFromPreset,
  };
};

/**
 * Dot button for carousel
 * @link https://www.embla-carousel.com/examples/predefined/#align
 * @param emblaApi Embla Carousel API
 * @returns
 */
export const useDotButton = (emblaApi: CarouselApi): UseDotButtonType => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onDotButtonClick,
  };
};
