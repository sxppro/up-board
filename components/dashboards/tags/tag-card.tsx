import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getTagInfo } from '@/db';
import { cn, formatCurrency } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Card } from '@tremor/react';
import Link from 'next/link';

export const TagCardFallback = ({ id }: { id: string }) => (
  <Card className="flex flex-col ring-border bg-background gap-1 p-0">
    <div className="flex flex-col gap-2 p-3">
      <h2 className="text-lg font-medium">{id}</h2>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
    </div>
    <Separator />
    <Button
      variant="link"
      className="h-auto justify-end gap-1 p-3 text-fuchsia-600 dark:text-fuchsia-400"
    >
      Loading ...
    </Button>
  </Card>
);

const TagCard = async ({ id }: { id: string }) => {
  const stats = await getTagInfo(id);
  console.log(stats);

  return (
    <Card className="flex flex-col ring-border bg-background gap-1 p-0">
      <div className="flex flex-col gap-2 p-3">
        <h2 className="text-lg font-medium">{id}</h2>
        {stats ? (
          <>
            <span className="flex gap-1 items-center text-sm text-muted-foreground">
              <Badge variant="outline">{stats.Transactions}</Badge>transactions
            </span>
            <span className="flex gap-2 items-center text-sm">
              <Badge variant="secondary">In</Badge>
              {formatCurrency(stats.Income)}
              <Badge variant="secondary">Out</Badge>
              {formatCurrency(stats.Expenses)}
            </span>
          </>
        ) : null}
      </div>
      <Separator />
      <Button
        variant="link"
        className={cn(
          'h-auto justify-end p-3 text-fuchsia-600 dark:text-fuchsia-400',
          focusRing
        )}
        asChild
      >
        <Link className="flex items-center gap-x-1" href={`/tags/${id}`}>
          More details
          <ArrowRight className="size-8" />
        </Link>
      </Button>
    </Card>
  );
};

export default TagCard;
