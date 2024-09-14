## Up Board

Data visualisation for your Up account that's insightful and lets you see what's going on with your 💸

### Tech

- Next.js (this application)
  - Tailwind + [shadcn/ui](https://ui.shadcn.com/) + [tremor](https://www.tremor.so/)
- MongoDB
- AWS Lambda
  - Consumes Up webhook event to sync new, deleted or settled transactions
  - Also used to periodically sync changes to transaction categories and tags

### Learn More

To read more about Up's API, please go to https://developer.up.com.au/.

### Usage

#### Generating mock data

1. Install [tsx](https://www.npmjs.com/package/tsx) as a global dependency
2. Add `type: "module"` to `package.json` locally
3. Run `scripts/generateMockData.ts` to generate mock account and transaction data

Categories data is obtained from `https://api.up.com.au/api/v1/categories` endpoint.
