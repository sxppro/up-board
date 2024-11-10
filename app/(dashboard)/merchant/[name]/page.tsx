import QueryProvider from '@/components/providers/query-provider';
import TransactionsList from '@/components/tables/transactions-list';
import { Separator } from '@/components/ui/separator';
import { checkMerchant, getTransactionsByDay } from '@/db';
import { redirect } from 'next/navigation';

const MerchantPage = async ({ params }: { params: { name: string } }) => {
  const { name } = params;
  const merchant = decodeURIComponent(name);
  const check = await checkMerchant(merchant);

  if (!check) {
    return redirect('/merchants');
  }

  const transactions = await getTransactionsByDay({
    match: { 'attributes.description': merchant },
  });

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
      <QueryProvider>
        <TransactionsList transactions={transactions} />
      </QueryProvider>
    </section>
  );
};

export default MerchantPage;
