'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RiArrowRightUpLine,
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
} from '@remixicon/react';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface UserProfileDropdownProps {
  children: React.ReactNode;
  align?: 'center' | 'start' | 'end';
  user?: Pick<User, 'name' | 'image' | 'email'>;
}

export function UserProfileDropdown({
  children,
  align = 'start',
  user,
}: UserProfileDropdownProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="w-[calc(var(--radix-dropdown-menu-trigger-width))] max-h-[var(--radix-popper-available-height)]"
        >
          {user?.email ? (
            <DropdownMenuLabel className="truncate">
              {user.email}
            </DropdownMenuLabel>
          ) : (
            ''
          )}
          <DropdownMenuGroup>
            {mounted ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) => {
                      setTheme(value);
                    }}
                  >
                    <DropdownMenuRadioItem
                      aria-label="Switch to Light Mode"
                      value="light"
                      className="gap-x-2"
                    >
                      <RiSunLine
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      aria-label="Switch to Dark Mode"
                      value="dark"
                      className="gap-x-2"
                    >
                      <RiMoonLine
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      aria-label="Switch to System Mode"
                      value="system"
                      className="gap-x-2"
                    >
                      <RiComputerLine
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              ''
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href={'https://github.com/sxppro'}
                className="cursor-pointer"
              >
                Author
                <RiArrowRightUpLine
                  className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                  aria-hidden="true"
                />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={'https://github.com/sxppro/up-board'}
                className="cursor-pointer"
              >
                View source
                <RiArrowRightUpLine
                  className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                  aria-hidden="true"
                />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {user ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    signOut({
                      callbackUrl: `${window.location.origin}/login`,
                    });
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : (
            ''
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
