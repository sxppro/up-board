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
import { useTheme } from 'next-themes';
import * as React from 'react';

export type UserProfileDropdownProps = {
  children: React.ReactNode;
  align?: 'center' | 'start' | 'end';
};

export function UserProfileDropdown({
  children,
  align = 'start',
}: UserProfileDropdownProps) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="min-w-[calc(var(--radix-dropdown-menu-trigger-width))] max-h-[var(--radix-popper-available-height)]"
        >
          <DropdownMenuLabel>emma.stone@acme.com</DropdownMenuLabel>
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
            <DropdownMenuItem>
              Changelog
              <RiArrowRightUpLine
                className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Documentation
              <RiArrowRightUpLine
                className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Join Slack community
              <RiArrowRightUpLine
                className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
