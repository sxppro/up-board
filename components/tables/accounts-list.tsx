import { getAccounts } from '@/db';
import { components } from '@/types/up-api';
import { Badge, Card, Color, Flex } from '@tremor/react';
import { ChevronRight } from 'lucide-react';
import ActiveLink from '../core/active-link';
import { Skeleton } from '../ui/skeleton';

interface AccountsListProps {
  type: components['schemas']['AccountTypeEnum'];
  colour: Color;
}

export const AccountsListLoading = () => (
  <Card>
    <Flex alignItems="center" justifyContent="between">
      <Flex className="gap-2" flexDirection="col" alignItems="start">
        <Badge className="font-semibold px-2.5 py-0.5 -m-1" size="xs">
          <Skeleton className="h-5 w-24 max-w-[6rem] p-1" />
        </Badge>
        <Skeleton className="h-8 w-[20rem]" />
      </Flex>
      <ChevronRight className="h-8 w-8" />
    </Flex>
  </Card>
);

const AccountsList = async ({ type, colour }: AccountsListProps) => {
  const accounts = await getAccounts(type);

  return (
    <>
      {accounts.map(({ id, displayName, accountType }) => (
        <Card
          key={id}
          className="shadow-sm hover:shadow-md p-0 transition-shadow ease-in-out duration-300"
          decoration="top"
          decorationColor={colour}
        >
          <ActiveLink href={`/account/${id}`} keepQueryParams>
            <Flex className="p-6" alignItems="center" justifyContent="between">
              <Flex className="gap-1" flexDirection="col" alignItems="start">
                <Badge className="font-semibold px-2.5 py-0.5 -m-1" size="xs">
                  {accountType}
                </Badge>
                <p className="truncate text-xl max-w-xs">{displayName}</p>
              </Flex>
              <ChevronRight className="h-8 w-8" />
            </Flex>
          </ActiveLink>
        </Card>
      ))}
    </>
  );
};

export default AccountsList;
