import tailwindConfig from '@/tailwind.config';
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

const MonthlySummary = () => {
  return (
    <Html lang="en">
      <Head />
      <Preview>Up Board — March 2025</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className="bg-slate-50 text-slate-900 font-sans">
          <Container className="mx-auto w-full max-w-[600px] p-8">
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
                March 2025
              </Text>
            </Section>

            {/* Spend grid */}
            <Section className="my-4">
              <Row cellSpacing={16} cellPadding={8}>
                <Column className="h-[200px] w-1/2 border border-solid border-slate-200 rounded-2xl shadow">
                  <div className="h-full flex flex-col justify-end gap-4">
                    <Text className="text-3xl font-medium">$456.56</Text>
                    <Text className="text-lg">Good Life</Text>
                  </div>
                </Column>
                <Column className="h-[200px] w-1/2 border border-solid border-slate-200 rounded-2xl shadow">
                  <Text>Test</Text>
                </Column>
              </Row>
              <Row cellSpacing={16} cellPadding={8} className="-mt-4">
                <Column className="h-[200px] w-1/2 border border-solid border-slate-200 rounded-2xl shadow">
                  <Text>Test</Text>
                </Column>
                <Column className="h-[200px] w-1/2 border border-solid border-slate-200 rounded-2xl shadow"></Column>
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

export default MonthlySummary;
