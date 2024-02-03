import TagDashboard from '@/components/dashboards/tag';
import { Suspense } from 'react';

const TagPage = async ({ params }: { params: { tagId: string } }) => {
  const { tagId } = params;
  const decodedTagId = decodeURIComponent(tagId);
  console.log(decodedTagId);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">{decodedTagId}</h1>
      <Suspense>
        <TagDashboard tag={decodedTagId} />
      </Suspense>
    </>
  );
};

export default TagPage;
