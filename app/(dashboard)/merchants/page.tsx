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
      <MerchantsDataTable data={merchants} columns={columns} />
    </section>
  );
};

export default MerchantsPage;
