import { Merchant, TransactionCategoryInfo } from '@/server/schemas';
import tailwindConfig from '@/tailwind.config';
import { AvailableChartColorsKeys, getColorClassName } from '@/utils/charts';
import { colours } from '@/utils/constants';
import { cn, formatCurrencyAbsolute } from '@/utils/helpers';
import {
  Body,
  Column,
  ColumnProps,
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
  categorySpending: TransactionCategoryInfo[]; // Top spending categories
  subcategorySpending: TransactionCategoryInfo[]; // Top spending subcategories
  merchantSpending: Merchant[]; // Top spending merchants
}

interface SpendBarProps {
  percentage: number;
  spending: number;
  barColor?: string;
}

interface SpendGridTileProps {
  category: string; // Category name
  absSpending?: number; // Absolute value of amount spent in category
  spending?: number; // Amount spent in this category
  totalSpending?: number; // Absolute value of total amount spent over all categories
}

const MonthlySummary = ({
  dateRangeText,
  categorySpending,
  subcategorySpending,
  merchantSpending,
}: MonthlySummaryProps) => {
  // ! Assumes spending is sorted by absAmount descending
  const categorySpendingMax = categorySpending[0];
  const subcategorySpendingMax = subcategorySpending[0];
  const merchantSpendingMax = merchantSpending[0];
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
              <Heading className="my-4 text-4xl font-medium leading-tight">
                Your Month in Review
              </Heading>
              <Text className="inline-block my-1 bg-fuchsia-600 text-slate-50 text-sm font-normal uppercase tracking-wider rounded-full px-4 py-1">
                {dateRangeText}
              </Text>
            </Section>

            {/* Spend grid */}
            {categorySpending?.length > 0 && (
              <Section className="my-4">
                {[0, 2, 4].map((startIdx) => (
                  <Row
                    key={startIdx}
                    cellPadding={12}
                    className={startIdx > 0 ? 'mt-4' : ''}
                    style={{
                      borderSpacing: '16px 0px',
                    }}
                  >
                    {/* Last tile will be 2 col span */}
                    {startIdx === 4 ? (
                      categorySpending[startIdx] && (
                        <SpendGridTile
                          className="pt-3 sm:pt-3"
                          colSpan={2}
                          category={categorySpending[startIdx].categoryName}
                          absSpending={categorySpending[startIdx].absAmount}
                          spending={categorySpending[startIdx].amount}
                          totalSpending={categorySpendingMax.absAmount}
                        />
                      )
                    ) : (
                      <>
                        {categorySpending[startIdx] && (
                          <SpendGridTile
                            className="mr-4"
                            category={categorySpending[startIdx].categoryName}
                            absSpending={categorySpending[startIdx].absAmount}
                            spending={categorySpending[startIdx].amount}
                            totalSpending={categorySpendingMax.absAmount}
                          />
                        )}
                        {categorySpending[startIdx + 1] && (
                          <SpendGridTile
                            category={
                              categorySpending[startIdx + 1].categoryName
                            }
                            absSpending={
                              categorySpending[startIdx + 1].absAmount
                            }
                            spending={categorySpending[startIdx + 1].amount}
                            totalSpending={categorySpendingMax.absAmount}
                          />
                        )}
                      </>
                    )}
                  </Row>
                ))}
              </Section>
            )}

            {/* Top subcategories */}
            {subcategorySpending && subcategorySpending.length > 0 ? (
              <Section className="my-6 px-4">
                <Text className="text-3xl font-medium">
                  What you spent on ...
                </Text>
                {subcategorySpending.map(
                  ({
                    category,
                    categoryName,
                    parentCategoryName,
                    absAmount,
                    amount,
                  }) => (
                    <div key={category}>
                      <div className="flex justify-between mt-4 mb-1">
                        <Text className="text-md m-0">{categoryName}</Text>
                        <Text className="text-md m-0">
                          {formatCurrencyAbsolute(absAmount, amount)}
                        </Text>
                      </div>
                      <SpendBar
                        barColor={
                          parentCategoryName ? colours[parentCategoryName] : ''
                        }
                        percentage={
                          (absAmount / subcategorySpendingMax.absAmount) * 100
                        }
                        spending={absAmount}
                      />
                    </div>
                  )
                )}
              </Section>
            ) : null}

            {/* Top merchants */}
            {merchantSpending && merchantSpending.length > 0 ? (
              <Section className="my-6 px-4 max-w-full">
                <Text className="text-3xl font-medium">
                  Who you spent with ...
                </Text>
                {merchantSpending.map(
                  ({ name, absAmount, amount, parentCategoryName }) => (
                    <div key={name}>
                      <div className="flex justify-between mt-4 mb-1">
                        <Text className="text-md m-0 truncate">{name}</Text>
                        <Text className="text-md m-0">
                          {formatCurrencyAbsolute(absAmount, amount)}
                        </Text>
                      </div>
                      <SpendBar
                        barColor={
                          parentCategoryName ? colours[parentCategoryName] : ''
                        }
                        percentage={
                          (absAmount / merchantSpendingMax.absAmount) * 100
                        }
                        spending={absAmount}
                      />
                    </div>
                  )
                )}
              </Section>
            ) : null}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const SpendBar = ({ barColor, percentage, spending }: SpendBarProps) => {
  return spending === 0 ? (
    <div
      className="h-2 rounded-full border border-dashed border-gray-500"
      style={{ width: '100%' }}
    />
  ) : (
    <div
      className={cn(
        'h-2 rounded-full',
        getColorClassName(
          barColor ?? ('gray' as AvailableChartColorsKeys),
          'bg'
        ),
        percentage === 0 && 'hidden'
      )}
      style={{ width: `${percentage}%` }}
    />
  );
};

const SpendGridTile = ({
  category,
  absSpending = 0,
  spending = 0,
  totalSpending = spending,
  className,
  ...rest
}: SpendGridTileProps & ColumnProps) => {
  const barColor = colours[category];
  const percentage = (absSpending / totalSpending) * 100;
  return (
    <Column
      {...rest}
      className={cn(
        'w-1/2 pt-12 sm:pt-24 border border-solid border-slate-200 rounded-2xl shadow',
        className
      )}
    >
      <div className="h-full flex flex-col justify-end gap-2">
        <Text className="text-4xl font-medium m-0">
          {formatCurrencyAbsolute(absSpending, spending, true, true)}
        </Text>
        <Text className="text-lg m-0">{category}</Text>
        <SpendBar
          barColor={barColor}
          spending={spending}
          percentage={percentage}
        />
      </div>
    </Column>
  );
};

MonthlySummary.PreviewProps = {
  dateRangeText: 'March 2025',
  categorySpending: [
    {
      category: 'personal',
      categoryName: 'Personal',
      absAmount: 2349.0,
      amount: -2349.0,
      transactions: 25,
    },
    {
      category: 'good-life',
      categoryName: 'Good Life',
      absAmount: 1198.0,
      amount: -1198.0,
      transactions: 20,
    },
    {
      category: 'uncategorised',
      categoryName: 'Uncategorised',
      absAmount: 234.59,
      amount: 234.59,
      transactions: 2,
      parentCategory: 'uncategorised',
    },
    {
      category: 'transport',
      categoryName: 'Transport',
      absAmount: 90.0,
      amount: -90.0,
      transactions: 3,
    },
    {
      category: 'home',
      categoryName: 'Home',
      absAmount: 25.49,
      amount: -25.49,
      transactions: 5,
    },
  ],
  subcategorySpending: [
    {
      category: 'homeware-and-appliances',
      categoryName: 'Homeware & Appliances',
      parentCategory: 'home',
      parentCategoryName: 'Home',
      amount: -888.87,
      absAmount: 888.87,
      transactions: 6,
    },
    {
      category: 'restaurants-and-cafes',
      categoryName: 'Restaurants & Cafes',
      parentCategory: 'good-life',
      parentCategoryName: 'Good Life',
      amount: -844.24,
      absAmount: 844.24,
      transactions: 19,
    },
    {
      category: 'public-transport',
      categoryName: 'Public Transport',
      parentCategory: 'transport',
      parentCategoryName: 'Transport',
      amount: -806.82,
      absAmount: 806.82,
      transactions: 79,
    },
    {
      category: 'fitness-and-wellbeing',
      categoryName: 'Fitness & Wellbeing',
      parentCategory: 'personal',
      parentCategoryName: 'Personal',
      amount: 181.77,
      absAmount: 181.77,
      transactions: 53,
    },
  ],
  merchantSpending: [
    {
      name: 'Investments Co.',
      absAmount: 500,
      amount: -500,
      transactions: 2,
      category: 'investments',
      categoryName: 'Investments',
      parentCategory: 'personal',
      parentCategoryName: 'Personal',
    },
    {
      name: 'Fancy Dining',
      absAmount: 200,
      amount: -200,
      transactions: 1,
      category: 'restaurants-and-cafes',
      categoryName: 'Restaurants & Cafes',
      parentCategory: 'good-life',
      parentCategoryName: 'Good Life',
    },
    {
      name: 'Fitness Club',
      absAmount: 45.0,
      amount: -45.0,
      transactions: 1,
      category: 'fitness-and-wellbeing',
      categoryName: 'Fitness & Wellbeing',
      parentCategory: 'personal',
      parentCategoryName: 'Personal',
    },
    {
      name: 'Public Transport Authority',
      absAmount: 40.0,
      amount: -40.0,
      transactions: 2,
      category: 'public-transport',
      categoryName: 'Public Transport',
      parentCategory: 'transport',
      parentCategoryName: 'Transport',
    },
  ],
};

export default MonthlySummary;
