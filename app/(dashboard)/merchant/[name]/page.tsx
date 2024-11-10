import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import QueryProvider from '@/components/providers/query-provider';
import TransactionsList from '@/components/tables/transactions-list';
import { Separator } from '@/components/ui/separator';
import {
  getCategoryInfoHistory,
  getIOStats,
  getMerchantInfo,
  getTransactionsByDay,
} from '@/db';
import { now } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';
import { Card } from '@tremor/react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { redirect } from 'next/navigation';

const MerchantPage = async ({ params }: { params: { name: string } }) => {
  const { name } = params;
  const merchant = decodeURIComponent(name);
  const merchantInfo = await getMerchantInfo({
    match: { 'attributes.description': merchant },
  });

  if (!merchantInfo[0]) {
    return redirect('/merchants');
  }

  const transactions = await getTransactionsByDay({
    match: { 'attributes.description': merchant },
  });
  const stats = await getIOStats({
    match: { 'attributes.description': merchant },
  });
  const statsHistorical = await getCategoryInfoHistory(
    {
      from: startOfMonth(subMonths(now, 12)),
      to: now,
    },
    'parent',
    { match: { 'attributes.description': merchant }, groupBy: 'monthly' }
  );
  // Map of categories a merchant is categorised as
  // (to account for multiple categories a
  // merchant can be categorised as)
  const merchantCategoryMap = new Map<string, string>();
  const chartStats = statsHistorical.map(({ month, year, categories }) => {
    const date =
      month && year
        ? format(new Date(year, month - 1), 'LLL yy')
        : format(new Date(year, 0, 1), 'yyyy');
    const remappedElem: any = {
      FormattedDate: date,
    };
    categories.forEach(({ amount, category, categoryName }) => {
      merchantCategoryMap.set(category, categoryName);
      remappedElem[categoryName] = amount;
    });
    return remappedElem;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <Card className="ring-border bg-background p-3">
          <div className="flex gap-1">
            <p className="text-muted-foreground">Transactions</p>
          </div>
          <p className="text-2xl font-semibold">{stats[0]?.Transactions}</p>
        </Card>
        <Card className="ring-border bg-background p-3">
          <p className="text-muted-foreground">All time</p>
          <p className="text-2xl font-semibold">
            {formatCurrency(stats[0]?.Net)}
          </p>
        </Card>
      </div>
      <ExpenseCategoriesBar
        data={chartStats}
        index="FormattedDate"
        categories={Array.from(merchantCategoryMap, ([_, value]) => value)}
        colors={Array.from(merchantCategoryMap, ([key]) => `up-${key}`)}
      />
      <QueryProvider>
        <TransactionsList transactions={transactions} />
      </QueryProvider>
    </section>
  );
};

export default MerchantPage;
