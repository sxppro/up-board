import { Separator } from '@/components/ui/separator';
import { getMerchants } from '@/db';
import { cn } from '@/utils/helpers';

const MerchantsPage = async () => {
  const merchants = await getMerchants({});

  return (
    <section
      aria-labelledby="merchants-overview"
      className="flex flex-col gap-3"
    >
      <div>
        <h1
          id="accounts-overview"
          className="text-2xl font-semibold tracking-tight"
        >
          Merchants
        </h1>
        <Separator className="mt-2" />
      </div>
      <div className="flex flex-col gap-2">
        {merchants?.map(({ name, categoryName, parentCategory }) => (
          <div key={name} className="flex items-center gap-4 font-medium">
            <span
              className={cn(
                'flex aspect-square size-12 items-center justify-center rounded-md p-2 font-normal text-white text-xl',
                `bg-up-${parentCategory}`
              )}
              aria-hidden="true"
            >
              {name.slice(0, 1).toUpperCase()}
            </span>
            <h2 className="flex-1 text-xl">{name}</h2>
            <span>{categoryName}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MerchantsPage;
