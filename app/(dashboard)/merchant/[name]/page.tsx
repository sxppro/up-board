import { Separator } from '@/components/ui/separator';
import { redirect } from 'next/navigation';

const MerchantPage = ({ params }: { params: { name: string } }) => {
  const { name } = params;

  if (!name) {
    return redirect('/merchants');
  }

  const merchant = decodeURIComponent(name);

  return (
    <section
      aria-labelledby="merchant-overview"
      className="flex flex-col gap-3"
    >
      <div>
        <h1
          id="merchant-overview"
          className="text-2xl font-semibold tracking-tight"
        >
          {merchant}
        </h1>
        <Separator className="mt-2" />
      </div>
    </section>
  );
};

export default MerchantPage;
