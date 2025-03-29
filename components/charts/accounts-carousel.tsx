'use client';

import { AccountInfo } from '@/server/schemas';
import { cn, formatCurrency } from '@/utils/helpers';
import { useDotButton } from '@/utils/hooks';
import { focusRing } from '@/utils/tremor';
import { Card } from '@tremor/react';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  EmblaCarouselType,
} from '../ui/carousel';

interface AccountsCarousel {
  accounts: AccountInfo[];
}

const AccountsCarousel = ({ accounts }: AccountsCarousel) => {
  const [api, setApi] = useState<CarouselApi>();
  const [account, setAccount] = useQueryState('id', {
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
    if (account) api.scrollTo(accounts.findIndex((acc) => acc.id === account));
    api.on('select', updateCurrent);
  }, [api, accounts, account, updateCurrent]);

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
      <div className="flex items-center justify-between mt-2 mx-4 sm:mx-6 lg:mx-10">
        <CarouselPrevious className={cn('static translate-y-0', focusRing)} />
        <div className="flex gap-3">
          {scrollSnaps.map((_, index) => (
            <Button
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={cn(
                'size-2 p-0 transition-all rounded-full appearance-none touch-manipulation cursor-pointer',
                focusRing,
                index === selectedIndex ? 'bg-primary' : 'bg-muted-foreground'
              )}
            />
          ))}
        </div>
        <CarouselNext
          className={cn('static transition-all translate-y-0', focusRing)}
        />
      </div>
    </Carousel>
  );
};

export default AccountsCarousel;
