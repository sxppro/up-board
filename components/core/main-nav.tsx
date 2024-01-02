import { cn } from '@/utils/helpers';
import ActiveLink from './active-link';

const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      <ActiveLink href="/">Overview</ActiveLink>
      <ActiveLink href="/transactions">Transactions</ActiveLink>
    </nav>
  );
};

export default MainNav;
