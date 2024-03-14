'use client';

import { Dispatch, SetStateAction } from 'react';
import ActiveLink from './active-link';

interface MainNavProps {
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

const MainNav = ({
  setOpen,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & MainNavProps) => {
  return (
    <nav className={className} {...props}>
      <ActiveLink href="/" onClick={() => setOpen && setOpen(false)}>
        Overview
      </ActiveLink>
      <ActiveLink
        href="/transactions"
        onClick={() => setOpen && setOpen(false)}
      >
        Transactions
      </ActiveLink>
    </nav>
  );
};

export default MainNav;
