'use client';

import { AccountInfo } from '@/server/schemas';
import { cn, formatCurrency } from '@/utils/helpers';
import { useDotButton } from '@/utils/hooks';
import { Card } from '@tremor/react';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  EmblaCarouselType,
} from '../ui/carousel';

interface AccountsCarousel {
  accounts: AccountInfo[];
}

const AccountsCarousel = ({ accounts }: AccountsCarousel) => {
  const [api, setApi] = useState<CarouselApi>();
  const [_, setAccount] = useQueryState('id', {
    defaultValue: accounts[0]?.id,
    shallow: false,
  });
  const updateCurrent = useCallback(
    (api: EmblaCarouselType) => {
      setAccount(accounts[api.selectedScrollSnap()]?.id);
    },
    [accounts, setAccount]
  );
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

  useEffect(() => {
    if (!api) return;
    api.on('select', updateCurrent);
  }, [api, updateCurrent]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ containScroll: false }}
      className="-mx-4 sm:-mx-6 lg:-mx-10"
    >
      <CarouselContent>
        {accounts.map((account) => (
          <CarouselItem
            key={account.id}
            className="basis-[87.5%] md:basis-1/2 lg:basis-5/12"
          >
            <div className="border rounded-tremor-default">
              <Card
                decoration={'left'}
                decorationColor={
                  account.accountType === 'TRANSACTIONAL' ? 'fuchsia' : 'lime'
                }
                className="ring-0 bg-background p-3"
              >
                <p className="text-lg font-medium">{account.displayName}</p>
                <p className="text-subtle">{formatCurrency(account.balance)}</p>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-2 gap-3">
        {scrollSnaps.map((_, index) => (
          <Button
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={cn(
              'size-2 p-0 transition rounded-full appearance-none touch-manipulation cursor-pointer',
              index === selectedIndex ? 'bg-primary' : 'bg-muted-foreground'
            )}
          />
        ))}
      </div>
    </Carousel>
  );
};

export default AccountsCarousel;
