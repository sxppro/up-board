import { StatCardInfo } from '@/types/custom';
import { Card, Flex, Icon, Metric, Text } from '@tremor/react';
import { PropsWithChildren } from 'react';
import { Skeleton } from '../ui/skeleton';

interface StatCardProps extends PropsWithChildren {
  info: StatCardInfo;
}

const StatCard = ({ children, info }: StatCardProps) => {
  const { title, metric, icon, color, isLoading } = info;
  return (
    <Card
      className="transition-shadow hover:shadow-md"
      decoration="top"
      decorationColor={color}
    >
      <Flex justifyContent="start" className="space-x-4">
        {icon ? (
          <Icon icon={icon} variant="light" size="xl" color={color} />
        ) : (
          ''
        )}
        {children}
        <div className="truncate flex-1">
          {title ? (
            <Flex alignItems="start" justifyContent="between">
              <Text>{title}</Text>
            </Flex>
          ) : (
            ''
          )}
          {isLoading ? (
            <Skeleton className="h-9 max-w-[150px]" />
          ) : (
            <Metric className="truncate">{metric}</Metric>
          )}
        </div>
      </Flex>
    </Card>
  );
};

export default StatCard;
