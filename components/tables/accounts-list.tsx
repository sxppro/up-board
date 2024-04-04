import { getAccounts } from '@/db';
import { components } from '@/types/up-api';
import { Badge, Card, Color, Flex } from '@tremor/react';
import { ChevronRight } from 'lucide-react';
import ActiveLink from '../core/active-link';

interface AccountsListProps {
  type: components['schemas']['AccountTypeEnum'];
  colour: Color;
}

const AccountsList = async ({ type, colour }: AccountsListProps) => {
  const accounts = await getAccounts(type);

  return (
    <>
      {accounts.map(({ id, displayName, accountType }) => (
        <Card
          key={id}
          className="shadow-sm hover:shadow-lg p-0"
          decoration="top"
          decorationColor={colour}
        >
          <ActiveLink href={`/account/${id}`} keepQueryParams>
            <Flex className="p-6" alignItems="center" justifyContent="between">
              <Flex className="gap-1" flexDirection="col" alignItems="start">
                <Badge className="font-semibold px-2.5 py-0.5 -m-1" size="xs">
                  {accountType}
                </Badge>
                <p className="truncate text-xl">{displayName}</p>
              </Flex>
              <ChevronRight className="h-6 w-6" />
            </Flex>
          </ActiveLink>
        </Card>
      ))}
    </>
  );
};

export default AccountsList;
