import { z } from 'zod';

export const DateRange = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});
export type DateRange = z.infer<typeof DateRange>;

export const TransactionCategoryType = z.enum(['child', 'parent']);
export type TransactionCategoryType = z.infer<typeof TransactionCategoryType>;

export const TransactionCategoryInfo = z.object({
  category: z.string(),
  amount: z.number(),
  transactions: z.number(),
});
export type TransactionCategoryInfo = z.infer<typeof TransactionCategoryInfo>;

export const AccountMonthlyInfo = z.object({
  Year: z.number(),
  Month: z.number(),
  Income: z.number(),
  Expenses: z.number(),
  Transactions: z.number(),
});
export type AccountMonthlyInfo = z.infer<typeof AccountMonthlyInfo>;
