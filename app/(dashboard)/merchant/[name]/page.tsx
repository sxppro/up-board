import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import QueryProvider from '@/components/providers/query-provider';
import TransactionsList from '@/components/tables/transactions-list';
import { Separator } from '@/components/ui/separator';
import {
  getIOStats,
  getMerchantInfo,
  getMerchantInfoHistory,
  getTransactionsByDay,
} from '@/db';
import { now } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';
import { tz } from '@date-fns/tz';
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
  const statsHistorical = await getMerchantInfoHistory(merchant, {
    from: startOfMonth(subMonths(now, 12), { in: tz('+00:00') }),
    to: now,
  });
  const chartStats = statsHistorical.map(({ Timestamp, ...rest }) => {
    const formattedDate = format(Timestamp, 'LLL yy');
    return {
      ...rest,
      Timestamp,
      FormattedDate: formattedDate,
    };
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
        categories={['Amount']}
        colors={[`up-${merchantInfo[0].parentCategory}`]}
      />
      <QueryProvider>
        <TransactionsList transactions={transactions} />
      </QueryProvider>
    </section>
  );
};

export default MerchantPage;
