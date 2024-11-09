import { Separator } from '@/components/ui/separator';
import { getMerchants } from '@/db';
import { columns } from './columns';
import MerchantsDataTable from './data-table';

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
      <MerchantsDataTable data={merchants} columns={columns} />
    </section>
  );
};

export default MerchantsPage;
