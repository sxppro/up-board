'use client';

import { cn } from '@/utils/helpers';
import Link, { LinkProps } from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';

type ActiveLinkProps = {
  keepQueryParams?: boolean;
} & LinkProps &
  PropsWithChildren;

/**
 * Checks whether current page matches link
 * @param keepQueryParams whether to maintain query params in URL
 * @returns
 */
const ActiveLink = ({
  children,
  href,
  keepQueryParams = false,
  ...rest
}: ActiveLinkProps) => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const isActive = pathName === href;
  return (
    <Link
      {...rest}
      href={keepQueryParams ? `${href}?${searchParams}` : href}
      className={cn(
        `text-sm font-medium transition-colors hover:text-primary`,
        isActive ? '' : 'text-muted-foreground'
      )}
    >
      {children}
    </Link>
  );
};

export default ActiveLink;
