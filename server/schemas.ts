import { endOfDay, startOfDay } from 'date-fns';
import { z } from 'zod';

const now = new Date();

export const DateRangeSchema = z.object({
  from: z.coerce
    .date()
    .optional()
    .default(() => startOfDay(now)),
  to: z.coerce
    .date()
    .optional()
    .default(() => endOfDay(now)),
});
export type DateRange = z.infer<typeof DateRangeSchema>;

export const TransactionCategoryOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});
export type TransactionCategoryOption = z.infer<
  typeof TransactionCategoryOptionSchema
>;

export const TransactionCategoryTypeSchema = z.enum(['child', 'parent']);
export type TransactionCategoryType = z.infer<
  typeof TransactionCategoryTypeSchema
>;

export const TransactionCategoryInfoSchema = z.object({
  category: z.string(),
  amount: z.number(),
  transactions: z.number(),
});
export type TransactionCategoryInfo = z.infer<
  typeof TransactionCategoryInfoSchema
>;

export const AccountMonthlyInfoSchema = z.object({
  Year: z.number(),
  Month: z.number(),
  Income: z.number(),
  Expenses: z.number(),
  Transactions: z.number(),
});
export type AccountMonthlyInfo = z.infer<typeof AccountMonthlyInfoSchema>;
