'use client';

import { AccountInfo } from '@/server/schemas';
import { formatCurrency } from '@/utils/helpers';
import { Card } from '@tremor/react';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '../ui/carousel';

interface AccountsCarousel {
  accounts: AccountInfo[];
}

const AccountsCarousel = ({ accounts }: AccountsCarousel) => {
  const [api, setApi] = useState<CarouselApi>();
  const [account, setAccount] = useQueryState('account', {
    defaultValue: accounts[0]?.id,
  });
  const updateCurrent = useCallback(
    (api: Exclude<CarouselApi, undefined>) => {
      setAccount(accounts[api.selectedScrollSnap()]?.id);
    },
    [accounts, setAccount]
  );
  console.log(account);

  useEffect(() => {
    if (!api) return;
    api.on('select', updateCurrent);
  }, [api, updateCurrent]);

  return (
    <Carousel setApi={setApi} opts={{ containScroll: false }}>
      <CarouselContent>
        {accounts.map((account) => (
          <CarouselItem
            key={account.id}
            className="basis-5/6 md:basis-1/2 lg:basis-5/12"
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
    </Carousel>
  );
};

export default AccountsCarousel;
