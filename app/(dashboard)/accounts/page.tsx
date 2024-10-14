import AccountsList, {
  AccountsListLoading,
} from '@/components/tables/accounts-list';
import { Suspense } from 'react';

const AccountsPage = () => {
  return (
    <section
      aria-labelledby="accounts-overview"
      className="flex flex-col gap-3"
    >
      <h1
        id="accounts-overview"
        className="text-2xl font-semibold tracking-tight"
      >
        Accounts
      </h1>
      <Suspense fallback={<AccountsListLoading />}>
        <AccountsList type="TRANSACTIONAL" colour="rose" />
      </Suspense>
      <Suspense
        fallback={
          <>
            <AccountsListLoading />
            <AccountsListLoading />
          </>
        }
      >
        <AccountsList type="SAVER" colour="teal" />
      </Suspense>
    </section>
  );
};

export default AccountsPage;
