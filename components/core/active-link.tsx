'use client';

import { cn } from '@/utils/helpers';
import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

/**
 * Checks whether current page matches link
 * @returns
 */
const ActiveLink = ({
  children,
  href,
  ...rest
}: PropsWithChildren & LinkProps) => {
  const pathName = usePathname();
  const isActive = pathName === href;
  return (
    <Link
      {...rest}
      href={href}
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
