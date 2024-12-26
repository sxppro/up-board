import { siteConfig } from '@/app/siteConfig';
import TagCard, {
  TagCardFallback,
} from '@/components/dashboards/tags/tag-card';
import { Separator } from '@/components/ui/separator';
import { getTags } from '@/db';
import { X } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Tags`,
};

const TagPage = async () => {
  const data = await getTags();

  return (
    <>
      {data ? (
        <section
          aria-labelledby="tags-overview"
          className="flex flex-col gap-3"
        >
          <div>
            <h1
              id="tags-overview"
              className="text-2xl font-bold tracking-tight"
            >
              Tags
            </h1>
            <Separator className="mt-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
            {data.tags &&
              data.tags.map((tag) => (
                <Suspense key={tag} fallback={<TagCardFallback id={tag} />}>
                  <TagCard id={tag} />
                </Suspense>
              ))}
          </div>
        </section>
      ) : (
        <div className="w-full flex h-screen">
          <div className="flex flex-col items-center gap-2 m-auto">
            <X className="h-8 w-8" />
            <h1 className="text-xl tracking-tight">No tags found</h1>
          </div>
        </div>
      )}
    </>
  );
};

export default TagPage;
