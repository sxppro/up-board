import { Card, Flex } from '@tremor/react';
import { PropsWithChildren } from 'react';

const DashboardCard = ({ children }: PropsWithChildren) => {
  return (
    <Card className="h-full sm:min-h-[425px] p-4">
      <Flex flexDirection="col" alignItems="start" className="h-full gap-2">
        {children}
      </Flex>
    </Card>
  );
};

export default DashboardCard;
