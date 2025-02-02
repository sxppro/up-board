import { DateRangeProps } from '@/types/custom';
import TransactionalCharts from './transactional';

export interface AccountChartsProps extends DateRangeProps {
  accountId: string;
  accountType: string;
}

const AccountCharts = async (props: AccountChartsProps) => {
  const { accountType } = props;
  return (
    <>
      {accountType === 'TRANSACTIONAL' ? (
        <TransactionalCharts {...props} />
      ) : (
        ''
      )}
    </>
  );
};

export default AccountCharts;
