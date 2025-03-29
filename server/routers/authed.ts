import { getTransactionById, replaceTransactions } from '@/db';
import { filterTransactionFields } from '@/db/helpers';
import { addTags, deleteTags, getAttachment, getTags } from '@/utils/up';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
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
        console.error(error, response);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      } else if (response.ok) {
        const res = await replaceTransactions([transactionId]);
        if (res !== 1) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }
      } else {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  deleteTags: authedProcedure
    .input(TransactionTagsModificationSchema)
    .mutation(async ({ input }) => {
      const { transactionId, tags } = input;
      const { error, response } = await deleteTags(transactionId, tags);
      if (error) {
        console.error(error, response);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      } else if (response.ok) {
        const res = await replaceTransactions([transactionId]);
        if (res !== 1) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }
      } else {
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
      return (await filterTransactionFields([transaction]))[0];
    }),
  getAttachment: authedProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      const { data, error } = await getAttachment(input);
      if (error || !data) {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return data.data;
    }),
});
