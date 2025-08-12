import type { DbTransactionResource } from '@/types/db';
import { now } from '@/utils/constants';
import { endOfDay, startOfDay } from 'date-fns';
import type { SortDirection } from 'mongodb';
import { z } from 'zod';

/**
 * Importing 3rd party types according to
 * @link https://github.com/colinhacks/zod/issues/52#issuecomment-629897855
 */
const SortDirection: z.ZodType<SortDirection> = z.any();
const DbTransactionResource: z.ZodType<DbTransactionResource> = z.any();

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

export const DateRangeGroupBySchema = z.enum([
  'hourly',
  'daily',
  'monthly',
  'yearly',
]);
export type DateRangeGroupBy = z.infer<typeof DateRangeGroupBySchema>;

export const Merchant = z.object({
  name: z.string(),
  absAmount: z.number(),
  amount: z.number(),
  transactions: z.number(),
  category: z.string(),
  categoryName: z.string().optional(),
  parentCategory: z.string(),
  parentCategoryName: z.string().optional(),
});
export type Merchant = z.infer<typeof Merchant>;

export const RetrievalOpts = z.object({
  match: z.record(z.string(), z.any()).optional(),
  sort: z.record(z.string(), SortDirection).optional(),
  limit: z.number().optional(),
  groupBy: DateRangeGroupBySchema.optional(),
});
export type RetrievalOptions = z.infer<typeof RetrievalOpts>;

export const TagInfoSchema = z.object({
  Income: z.number(),
  Expenses: z.number(),
  Net: z.number(),
  Transactions: z.number(),
});
export type TagInfo = z.infer<typeof TagInfoSchema>;

export const TransactionIdSchema = z.string().uuid();

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
  absAmount: z.number(),
  amount: z.number(),
  transactions: z.number(),
  parentCategory: z.string().optional(),
  parentCategoryName: z.string().optional(),
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
  day: z.number().optional(),
  month: z.number().optional(),
  year: z.number(),
  categories: z.array(
    TransactionCategoryInfoSchema.omit({ parentCategory: true })
  ),
});
export type TransactionCategoryInfoHistoryRaw = z.infer<
  typeof TransactionCategoryInfoHistoryRawSchema
>;

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
  isCategorizable: z.boolean(),
  note: z.string().nullable(),
  attachment: z.string().nullable(),
  amount: z.string(),
  amountRaw: z.number(),
  time: z.string().datetime(),
  status: TransactionStatusSchema,
  category: z.string(),
  categoryName: z.string(),
  parentCategory: z.string(),
  parentCategoryName: z.string(),
  tags: z.string().array(),
  transactionType: z.string().nullable(),
  deepLinkURL: z.string().optional(),
});
export type TransactionResourceFiltered = z.infer<
  typeof TransactionResourceFilteredSchema
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

export const TransactionGroupByDaySchema = z.object({
  timestamp: z.date(),
  transactions: z.array(DbTransactionResource),
});
export type TransactionGroupByDay = z.infer<typeof TransactionGroupByDaySchema>;

export const AccountInfoSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  balance: z.number(),
  accountType: z.string(),
  createdAt: z.string().datetime(),
});
export type AccountInfo = z.infer<typeof AccountInfoSchema>;

export const AccountMonthlyInfoSchema = z.object({
  Year: z.number().optional(),
  Month: z.number().optional(),
  Hour: z.number().optional(),
  In: z.number(),
  Out: z.number(),
  Net: z.number(),
  Transactions: z.number(),
  FormattedDate: z.string().optional(),
});
export type AccountMonthlyInfo = z.infer<typeof AccountMonthlyInfoSchema>;

/**
 * ! Note: until you add a data transformer to the query client
 * ! timestamp is an ISO string on the client
 */
export const BalanceHistorySchema = z.object({
  Timestamp: z.date(),
  Year: z.number(),
  Month: z.number(),
  Day: z.number(),
  Amount: z.number(),
  Balance: z.number(),
});
export type BalanceHistory = z.infer<typeof BalanceHistorySchema>;

export const CategoryInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentCategory: z.string().nullable(),
  parentCategoryName: z.string().nullable(),
});
export type CategoryInfo = z.infer<typeof CategoryInfoSchema>;

export const CumulativeIOSchema = z.object({
  Timestamp: z.date(),
  AmountCumulative: z.number().nullable(),
});
export type CumulativeIO = z.infer<typeof CumulativeIOSchema>;
