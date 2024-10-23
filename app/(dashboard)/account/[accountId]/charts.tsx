import { DateRangeProps } from '@/types/custom';
import SaverCharts from './saver';
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
      ) : accountType === 'SAVER' ? (
        <SaverCharts {...props} />
      ) : (
        ''
      )}
    </>
  );
};

export default AccountCharts;
