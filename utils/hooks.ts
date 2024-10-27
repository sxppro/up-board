import { CarouselApi, EmblaCarouselType } from '@/components/ui/carousel';
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subYears,
} from 'date-fns';
import { useCallback, useContext, useEffect, useState } from 'react';
import { now } from './constants';
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
 * Utility date ranges
 * @returns
 */
export const useDateRanges = () => {
  const thisMonth = {
    from: startOfMonth(now),
    to: endOfMonth(now),
  };

  const thisMonthLastYear = {
    from: subYears(thisMonth.from, 1),
    to: subYears(thisMonth.to, 1),
  };

  const thisYear = {
    from: startOfYear(now),
    to: endOfYear(now),
  };

  const lastYear = {
    from: subYears(thisYear.from, 1),
    to: subYears(thisYear.to, 1),
  };

  const monthToDate = {
    from: startOfMonth(now),
    to: now,
  };

  const yearToDate = {
    from: startOfYear(now),
    to: now,
  };

  return {
    thisMonth,
    thisYear,
    thisMonthLastYear,
    lastYear,
    monthToDate,
    yearToDate,
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
