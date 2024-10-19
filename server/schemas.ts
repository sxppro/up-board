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

export const DateRangeGroupBySchema = z.enum(['daily', 'monthly', 'yearly']);
export type DateRangeGroupBy = z.infer<typeof DateRangeGroupBySchema>;

export const TagInfoSchema = z.object({
  Income: z.number(),
  Expenses: z.number(),
  Transactions: z.number(),
});
export type TagInfo = z.infer<typeof TagInfoSchema>;

export const TransactionIdSchema = z.string().uuid();

export const TransactionAccountTypeSchema = z.enum([
  'transactional',
  'savings',
]);
export type TransactionAccountType = z.infer<
  typeof TransactionAccountTypeSchema
>;

export const TransactionCategoryOptionSchema = z.object({
  id: z.string(),
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
  categoryName: z.string(),
  amount: z.number(),
  transactions: z.number(),
});
export type TransactionCategoryInfo = z.infer<
  typeof TransactionCategoryInfoSchema
>;

export const TransactionCategoryInfoHistorySchema = z
  .object({
    FormattedDate: z.string(),
  })
  .catchall(z.number());
export type TransactionCategoryInfoHistory = z.infer<
  typeof TransactionCategoryInfoHistorySchema
>;

export const TransactionCategoryInfoHistoryRawSchema = z.object({
  month: z.number(),
  year: z.number(),
  categories: z.array(
    TransactionCategoryInfoSchema.omit({ categoryName: true })
  ),
});
export type TransactionCategoryInfoHistoryRaw = z.infer<
  typeof TransactionCategoryInfoHistoryRawSchema
>;

export const TransactionIncomeInfoSchema = z.object({
  description: z.string(),
  amount: z.number(),
  transactions: z.number(),
});
export type TransactionIncomeInfo = z.infer<typeof TransactionIncomeInfoSchema>;

export const TransactionIO = z.enum(['income', 'expense']);
export type TransactionIOEnum = z.infer<typeof TransactionIO>;

const TransactionStatusSchema = z.enum(['HELD', 'SETTLED']);

const TransactionTypeSchema = z.enum(['transactions', 'transfers']);
export type TransactionTypeEnum = z.infer<typeof TransactionTypeSchema>;

export const TransactionResourceFilteredSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  rawText: z.string().nullable(),
  message: z.string().nullable(),
  amount: z.string(),
  amountRaw: z.number(),
  time: z.string().datetime(),
  status: TransactionStatusSchema,
  category: z.string(),
  parentCategory: z.string(),
  tags: z.string().array(),
  deepLinkURL: z.string().optional(),
});
export type TransactionResourceFiltered = z.infer<
  typeof TransactionResourceFilteredSchema
>;

export const TransactionRetrievalOptionsSchema = z.object({
  account: TransactionAccountTypeSchema,
  dateRange: DateRangeSchema,
  transactionType: TransactionTypeSchema,
  sort: z.enum(['time', 'amount']),
  sortDir: z.enum(['asc', 'desc']),
  limit: z.number().optional(),
  type: TransactionIO.optional(),
});
export type TransactionRetrievalOptions = z.infer<
  typeof TransactionRetrievalOptionsSchema
>;

export const TransactionTagsModificationSchema = z.object({
  transactionId: TransactionIdSchema,
  tags: z
    .string()
    .max(30, {
      message: 'Tag must be 30 characters or fewer',
    })
    .array(),
});
export type TransactionTagsModification = z.infer<
  typeof TransactionTagsModificationSchema
>;

export const AccountMonthlyInfoSchema = z.object({
  Year: z.number().optional(),
  Month: z.number().optional(),
  Income: z.number(),
  Expenses: z.number(),
  Net: z.number(),
  Transactions: z.number(),
  FormattedDate: z.string().optional(),
});
export type AccountMonthlyInfo = z.infer<typeof AccountMonthlyInfoSchema>;

/**
 * ! Note: until you add a data transformer to the query client
 * ! timestamp is an ISO string on the client
 */
export const AccountBalanceHistorySchema = z.object({
  Timestamp: z.date(),
  Year: z.number(),
  Month: z.number(),
  Day: z.number(),
  Amount: z.number(),
  Balance: z.number(),
});
export type AccountBalanceHistory = z.infer<typeof AccountBalanceHistorySchema>;

export const CumulativeIOSchema = z.object({
  Timestamp: z.date(),
  AmountCumulative: z.number(),
});
export type CumulativeIO = z.infer<typeof CumulativeIOSchema>;
