'use client';

import {
  Card,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Title,
} from '@tremor/react';
import useSWR, { Fetcher } from 'swr';
import MainMetrics from './MainMetrics';
import Monthly from './Monthly';

const fetcher: Fetcher = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init).then((res) => res.json());

const BasicDashboard = () => {
  const { data, error, isLoading } = useSWR('/api/transactions', fetcher);
  if (data) console.log(data);

  return (
    <main className="max-w-screen-2xl m-auto py-4 px-4 md:px-8">
      <Title>Dashboard</Title>
      <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Page 1</Tab>
          <Tab>Page 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MainMetrics />
            <div className="mt-6">
              <Monthly />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <div className="h-96" />
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
};

export default BasicDashboard;
