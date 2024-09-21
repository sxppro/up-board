/**
 * Can't really find a good way to generate mock data
 * from OpenAPI spec, so just doing it this way for now
 *
 * openapi-sampler generates the shape and we fill in
 * string fields with more specific values using faker
 */

import { components } from '@/types/up-api';
import { fakerEN_AU as faker } from '@faker-js/faker';
import fs, { existsSync } from 'node:fs';
import path from 'node:path';
import { sample } from 'openapi-sampler';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import categories from '../mock/categories.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

faker.seed(17);

const getApiSchema = async () => {
  const res = await fetch(
    'https://raw.githubusercontent.com/up-banking/api/master/v1/openapi.json'
  );
  return await res.json();
};

/**
 * Generate mock accounts
 * @param schema Up API openapi.json
 * @param number number of accounts to generate
 */
const generateAccounts = (schema: any, accountIds: string[]) => {
  const numOfAccounts = accountIds.length;
  return [...Array(numOfAccounts)].map((_, i) => {
    const account = sample(
      schema['components']['schemas']['AccountResource'],
      {},
      schema
    ) as components['schemas']['AccountResource'];
    const accountBalance = faker.finance.amount({ min: 1 });

    account['type'] = 'accounts';
    account['id'] = accountIds[i];
    account['attributes']['accountType'] = faker.helpers.arrayElement([
      'TRANSACTIONAL',
      'SAVER',
    ]);
    account['attributes']['displayName'] = faker.finance.accountName();
    account['attributes']['balance']['value'] = accountBalance;
    account['attributes']['balance']['valueInBaseUnits'] =
      parseFloat(accountBalance) * 100;
    account['attributes']['balance']['currencyCode'] =
      faker.finance.currencyCode();
    account['attributes']['createdAt'] = faker.date
      .past({ years: 10 })
      .toISOString();
    return account;
  });
};

/**
 * Generate mock transactions
 * @param schema Up API openapi.json
 * @param accountIds existing account UUIDs
 * @param number number of transactions to generate
 * @returns
 */
const generateTransactions = (
  schema: any,
  options: { accountIds: string[]; tags: string[] },
  amount: number
) => {
  const { accountIds, tags } = options;
  return [...Array(amount)].map((_, i) => {
    const transaction = sample(
      schema['components']['schemas']['TransactionResource'],
      {},
      schema
    ) as components['schemas']['TransactionResource'];
    const subCategories = categories.data.filter(
      ({ relationships }) => relationships.parent.data
    );
    const chosenCategory = faker.helpers.arrayElement(subCategories);
    const date = faker.date.past().toISOString();
    const amount = faker.finance.amount({ min: -10000, max: 10000 });
    const merchant = faker.company.name();

    // Data
    transaction['type'] = 'transactions';
    transaction['id'] = faker.string.uuid();
    transaction['attributes']['status'] = faker.helpers.arrayElement([
      'HELD',
      'SETTLED',
    ]);
    transaction['attributes']['description'] = merchant;
    transaction['attributes'][
      'rawText'
    ] = `${merchant}, ${faker.location.city()} ${faker.location.zipCode()}`;
    transaction['attributes']['amount']['currencyCode'] =
      faker.finance.currencyCode();
    transaction['attributes']['amount']['value'] = amount;
    transaction['attributes']['amount']['valueInBaseUnits'] =
      parseFloat(amount) * 100;
    transaction['attributes']['createdAt'] = date;
    transaction['attributes']['settledAt'] = faker.date
      .soon({ refDate: date, days: 3 })
      .toISOString();
    transaction['attributes']['isCategorizable'] = faker.datatype.boolean(0.75);
    // Account
    transaction['relationships']['account']['data'] = {
      type: 'accounts',
      id: faker.helpers.arrayElement(accountIds),
    };
    // Subcategory
    transaction['relationships']['category']['data'] = {
      type: 'categories',
      id: chosenCategory.id,
    };
    // Category
    transaction['relationships']['parentCategory']['data'] = {
      type: 'categories',
      id: chosenCategory.relationships.parent.data?.id || '',
    };
    // Tag
    if (faker.datatype.boolean()) {
      transaction['relationships']['tags']['data'] = [
        {
          type: 'tags',
          id: faker.helpers.arrayElement(tags),
        },
      ];
    } else {
      transaction['relationships']['tags']['data'] = [];
    }

    return transaction;
  });
};

/**
 * Retrieves mock data from existing file or writes to file
 * with passed data
 * @param fileName
 * @param data
 * @returns
 */
export const getMockData = (fileName: string, data: any) => {
  if (!existsSync(path.join(__dirname, '../mock', `${fileName}.json`))) {
    Array.isArray(data)
      ? fs.writeFileSync(
          path.join(__dirname, '../mock', `${fileName}.json`),
          JSON.stringify({ data }, null, 2)
        )
      : fs.writeFileSync(
          path.join(__dirname, '../mock', `${fileName}.json`),
          JSON.stringify(data, null, 2)
        );
    return data;
  } else {
    const data = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../mock', `${fileName}.json`),
        'utf-8'
      )
    );
    return data.data ? data.data : data;
  }
};

// Only run if file is run directly
if (process.argv[1] === __filename) {
  getApiSchema().then((upApiSchema) => {
    // Create mock directory if not available
    if (!existsSync(path.join(__dirname, '../mock'))) {
      fs.mkdirSync(path.join(__dirname, '../mock'));
    }

    // Generate mock account UUIDs
    const accountIds = [...Array(3)].map(() => faker.string.uuid());

    // Generate mock tags
    const tags = [...Array(10)].map(
      () =>
        `${faker.commerce.productAdjective()} ${faker.commerce.productName()}`
    );

    fs.writeFileSync(
      path.join(__dirname, '../mock/accounts.json'),
      JSON.stringify(
        { data: generateAccounts(upApiSchema, accountIds) },
        null,
        2
      )
    );

    fs.writeFileSync(
      path.join(__dirname, '../mock/transactions.json'),
      JSON.stringify(
        {
          data: generateTransactions(upApiSchema, { accountIds, tags }, 20),
        },
        null,
        2
      )
    );

    fs.writeFileSync(
      path.join(__dirname, '../mock/tags.json'),
      JSON.stringify({ data: tags }, null, 2)
    );
  });
}
