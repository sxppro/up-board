import { getTransactionById, replaceTransactions } from '@/db';
import { filterTransactionFields } from '@/utils/helpers';
import { addTags, deleteTags, getTags } from '@/utils/up';
import { TRPCError } from '@trpc/server';
import {
  TransactionIdSchema,
  TransactionResourceFilteredSchema,
  TransactionTagsModificationSchema,
} from '../schemas';
import { authedProcedure, router } from '../trpc';

export const authedRouter = router({
  getTags: authedProcedure.query(async () =>
    (await getTags()).map(({ id }) => ({ name: id, value: id }))
  ),
  addTags: authedProcedure
    .input(TransactionTagsModificationSchema)
    .mutation(async ({ input }) => {
      const { transactionId, tags } = input;
      const { error, response } = await addTags(transactionId, tags);
      if (error) {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      const res = await replaceTransactions([transactionId]);
      if (!response.ok || res !== 1) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  deleteTags: authedProcedure
    .input(TransactionTagsModificationSchema)
    .mutation(async ({ input }) => {
      const { transactionId, tags } = input;
      const { error, response } = await deleteTags(transactionId, tags);
      if (error) {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      const res = await replaceTransactions([transactionId]);
      if (!response.ok || res !== 1) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  getTransactionById: authedProcedure
    .input(TransactionIdSchema)
    .output(TransactionResourceFilteredSchema)
    .query(async ({ input }) => {
      const transaction = await getTransactionById(input);
      if (!transaction) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return filterTransactionFields([transaction])[0];
    }),
});
