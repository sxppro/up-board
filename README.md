<h1>Up Board</h1>

Personalised insights and data visualisation for your Up account.

## Usage

### Generate mock data

1. Install [tsx](https://www.npmjs.com/package/tsx) as a global dependency
2. Add `type: "module"` to `package.json` locally
3. Run `tsx scripts/generateMockData.ts` to generate mock account and transaction data

Categories data is obtained from `https://api.up.com.au/api/v1/categories` endpoint.

### Update Up API schema

```zsh
npx openapi-typescript https://raw.githubusercontent.com/up-banking/api/refs/heads/master/v1/openapi.json -o types/up-api.d.ts

pnpm exec openapi-typescript https://raw.githubusercontent.com/up-banking/api/refs/heads/master/v1/openapi.json -o types/up-api.d.ts

# 🚀 https://raw.githubusercontent.com/up-banking/api/refs/heads/master/v1/openapi.json -> types/up-api.d.ts
```

## Notes

To read more about Up's API, please go to https://developer.up.com.au/.

This application is built with:

- Next.js (this repository)
  - Tailwind + [shadcn/ui](https://ui.shadcn.com/) + [tremor](https://www.tremor.so/)
- MongoDB
  - Stores transactions, accounts, categories
- AWS Lambda
  - Consumes Up webhook event to sync new, deleted or settled transactions
  - Periodically syncs changes to transaction categories and tags

## Screenshots

### Homepage

![Homepage](./media/homepage.png)

### Transaction account

![Transaction account](./media/transactional.png)

### Saver account

![Saver account](./media/saver.png)

### Transactions

![Transactions](./media/transactions.png)

### Transaction details

![Transaction details](./media/transaction-details.png)
