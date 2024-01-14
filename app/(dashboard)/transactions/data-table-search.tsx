import { Input } from '@/components/ui/input';
import { debounce } from '@/utils/helpers';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, ComponentProps } from 'react';

const DataTableSearch = ({
  onChange,
  ...rest
}: ComponentProps<typeof Input>) => {
  const { push } = useRouter();
  const pathname = usePathname();
  const search = (search: string) =>
    push(
      `${pathname}?${new URLSearchParams({
        search,
      })}`
    );

  const handleSearchInput = debounce((e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    if (e.target.value) {
      search(e.target.value);
    }
  }, 500);

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
