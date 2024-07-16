'use client';

import { Input } from '@/components/ui/input';
import { debounce } from '@/utils/helpers';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, ComponentProps, useMemo } from 'react';

const DataTableSearch = ({
  onChange,
  ...rest
}: ComponentProps<typeof Input>) => {
  const { push } = useRouter();
  const currentPath = usePathname();

  const handleSearchInput = useMemo(
    () =>
      debounce((e: ChangeEvent<HTMLInputElement>) => {
        const search = (search: string) =>
          push(
            `${currentPath}?${new URLSearchParams({
              search,
            })}`
          );
        if (e.target.value) {
          search(e.target.value);
        }
      }, 500),
    [currentPath, push]
  );

  return (
    <Input
      onChange={(e) => {
        if (onChange) onChange(e);
        handleSearchInput(e);
      }}
      {...rest}
    />
  );
};

export default DataTableSearch;
