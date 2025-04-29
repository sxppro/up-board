import MonthlySummary from '@/components/emails/MonthlySummary';
import { getCategoryInfo, getMerchantInfo } from '@/db';
import { now } from '@/utils/constants';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Resend } from 'resend';

const handler = async (req: Request) => {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('', { status: 401 });
  }

  if (!process.env.WHITELIST || !process.env.RESEND_API_KEY) {
    console.error('Error: Missing whitelist or Resend API key');
    return new Response('', { status: 500 });
  }

  /**
   * Fetch data for last month
   */
  const lastMonth = {
    from: startOfMonth(subMonths(now, 1)),
    to: endOfMonth(subMonths(now, 1)),
  };
  const categorySpending = await getCategoryInfo(lastMonth, 'parent', {
    sort: {
      amount: 1,
    },
  });
  const subcategorySpending = await getCategoryInfo(lastMonth, 'child', {
    sort: {
      amount: 1,
    },
    limit: 6,
  });
  const merchantSpending = await getMerchantInfo(
    { sort: { amount: 1 }, limit: 6 },
    lastMonth
  );

  /**
   * Send email
   */
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Up Board <insights@upboard.app>',
    to: process.env.WHITELIST,
    subject: `Your monthly summary for ${format(lastMonth.from, 'MMMM yyyy')}`,
    react: (
      <MonthlySummary
        dateRangeText={format(lastMonth.from, 'MMMM yyyy')}
        categorySpending={categorySpending}
        subcategorySpending={subcategorySpending}
        merchantSpending={merchantSpending}
      />
    ),
  });

  return new Response('', {
    status: 200,
  });
};

export { handler as GET };
