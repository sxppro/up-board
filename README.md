## Up Board

Personalised insights and data visualisation for your Up account so you can see where your 💸 is going

### Learn More

To read more about Up's API, please go to https://developer.up.com.au/.

### Usage

#### Generating mock data

1. Install [tsx](https://www.npmjs.com/package/tsx) as a global dependency
2. Add `type: "module"` to `package.json` locally
3. Run `tsx scripts/generateMockData.ts` to generate mock account and transaction data

Categories data is obtained from `https://api.up.com.au/api/v1/categories` endpoint.

### Tech

- Next.js (this application)
  - Tailwind + [shadcn/ui](https://ui.shadcn.com/) + [tremor](https://www.tremor.so/)
- MongoDB
  - Stores transactions, accounts, categories
- AWS Lambda
  - Consumes Up webhook event to sync new, deleted or settled transactions
  - Periodically syncs changes to transaction categories and tags
