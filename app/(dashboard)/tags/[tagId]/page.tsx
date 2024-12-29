import { siteConfig } from '@/app/siteConfig';
import TableSkeleton from '@/components/core/table-skeleton';
import QueryProvider from '@/components/providers/query-provider';
import TransactionsByTag from '@/components/tables/transaction-table-tag';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getTagInfo } from '@/db';
import { formatCurrency } from '@/utils/helpers';
import { Card } from '@tremor/react';
import { X } from 'lucide-react';
import { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';

type TagPageProps = {
  params: { tagId: string };
};

export async function generateMetadata(
  { params }: TagPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { tagId } = params;
  const decodedTagId = decodeURIComponent(tagId);
  return { title: `${siteConfig.name} — ${decodedTagId}` };
}

const TagPage = async ({ params }: TagPageProps) => {
  const { tagId } = params;
  const decodedTagId = decodeURIComponent(tagId);
  const stats = await getTagInfo(decodedTagId);

  return (
    <QueryProvider>
      {stats ? (
        <section
          aria-labelledby="tags-overview"
          className="flex flex-col gap-3"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {decodedTagId}
            </h1>
            <Separator className="mt-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            <Card className="ring-border bg-background p-3">
              <p className="text-muted-foreground">Average</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(stats.Net / stats.Transactions)}
              </p>
            </Card>
            <Card className="ring-border bg-background p-3">
              <p className="text-muted-foreground">All time</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(stats.Net)}
              </p>
            </Card>
            <Card className="ring-border bg-background p-3">
              <span className="flex gap-2 items-center text-xl font-semibold">
                <Badge variant="secondary">In</Badge>
                {formatCurrency(stats.Income)}
              </span>
              <span className="flex gap-2 items-center text-xl font-semibold">
                <Badge variant="secondary">Out</Badge>
                {formatCurrency(stats.Expenses)}
              </span>
            </Card>
          </div>
          <Suspense fallback={<TableSkeleton cols={4} rows={10} />}>
            <TransactionsByTag tag={decodedTagId} />
          </Suspense>
        </section>
      ) : (
        <div className="w-full flex h-[calc(100vh_-_94px)]">
          <div className="flex flex-col items-center gap-2 m-auto">
            <X className="h-8 w-8" />
            <h1 className="text-xl tracking-tight">Tag not found</h1>
          </div>
        </div>
      )}
    </QueryProvider>
  );
};

export default TagPage;
