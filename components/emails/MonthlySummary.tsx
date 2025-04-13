import tailwindConfig from '@/tailwind.config';
import { AvailableChartColorsKeys, getColorClassName } from '@/utils/charts';
import { colours } from '@/utils/constants';
import { cn, formatCurrency } from '@/utils/helpers';
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface MonthlySummaryProps {
  dateRangeText: string; // e.g. March 2025
}
interface SpendGridItemProps {
  category: string; // Category name
  spending?: number; // Amount spent in this category
  totalSpending?: number; // Total amount spent over all categories
}

const MonthlySummary = ({ dateRangeText }: MonthlySummaryProps) => {
  return (
    <Html lang="en">
      <Tailwind config={tailwindConfig}>
        <Head />
        <Preview>Up Board — March 2025</Preview>
        <Body className="bg-slate-50 text-slate-900 font-sans">
          <Container className="mx-auto w-full max-w-[600px] p-6">
            {/* Heading */}
            <Section className="text-center">
              <Text className="mx-0 my-4 p-0 text-2xl font-bold tracking-tight">
                Up Board
              </Text>
              <Hr className="my-2" />
              <Heading className="my-4 text-6xl font-medium leading-tight">
                Your Month in Review
              </Heading>
              <Text className="inline-block my-1 bg-fuchsia-600 text-slate-50 text-sm font-normal uppercase tracking-wider rounded-full px-4 py-1">
                {dateRangeText}
              </Text>
            </Section>

            {/* Spend grid */}
            <Section className="my-4">
              <Row cellSpacing={16} cellPadding={12}>
                <SpendGridItem category="Good Life" />
                <SpendGridItem category="Personal" />
              </Row>
              <Row cellSpacing={16} cellPadding={12} className="-mt-4">
                <SpendGridItem category="Home" />
                <SpendGridItem category="Transport" />
              </Row>
            </Section>

            {/* Top subcategories */}
            <Section className="my-6">
              <Text>What you spent on ...</Text>
            </Section>

            {/* Top merchants */}
            <Section className="my-6">
              <Text>Who you spend with ...</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const SpendGridItem = ({
  category,
  spending = 0,
  totalSpending = spending,
}: SpendGridItemProps) => {
  const barColor = colours[category] ?? 'gray';
  const percentage = (spending / totalSpending) * 100;
  return (
    <Column className="w-1/2 sm:pt-24 border border-solid border-slate-200 rounded-2xl shadow">
      <div className="h-full flex flex-col justify-end gap-2">
        <Text className="text-4xl font-medium m-0">
          {formatCurrency(spending)}
        </Text>
        <Text className="text-lg m-0">{category}</Text>
        {spending === 0 ? (
          <div
            className="h-2 rounded-full border border-dashed border-gray-500"
            style={{ width: '100%' }}
          />
        ) : (
          <div
            className={cn(
              'h-2 rounded-full',
              getColorClassName(barColor as AvailableChartColorsKeys, 'bg'),
              percentage === 0 && 'hidden'
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </Column>
  );
};

MonthlySummary.PreviewProps = {
  dateRangeText: 'March 2025',
};

export default MonthlySummary;
