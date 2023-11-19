import { cn } from '@/utils/helpers';
import ActiveLink from './ActiveLink';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      <ActiveLink href="/">Overview</ActiveLink>
      <ActiveLink href="/transactions">Transactions</ActiveLink>
    </nav>
  );
}
