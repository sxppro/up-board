import { checkTransactionsByAccount } from '@/db';

/**
 * Audit transactions by account
 */
(async () => await checkTransactionsByAccount('account-id'))();
