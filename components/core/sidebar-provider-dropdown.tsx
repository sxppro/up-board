'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/helpers';
import { focusInput } from '@/utils/tremor';
import { RiArrowRightSLine, RiExpandUpDownLine } from '@remixicon/react';
import React from 'react';
import { ModalAddProvider } from './modal-add-provider';

const accounts = [
  {
    value: 'up',
    name: 'Up',
    initials: 'UP',
    role: 'Account',
    color: 'bg-orange-600 dark:bg-orange-500',
  },
];

export const ProviderDropdownDesktop = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false);
  const dropdownTriggerRef = React.useRef<null | HTMLButtonElement>(null);
  const focusRef = React.useRef<null | HTMLButtonElement>(null);

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current;
  };

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open);
    if (open === false) {
      setDropdownOpen(false);
    }
  };
  return (
    <>
      {/* sidebar (lg+) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex w-full items-center gap-x-2.5 rounded-md border bg-white p-2 text-sm shadow-sm transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 hover:dark:bg-gray-900',
              focusInput
            )}
          >
            <span
              className="flex aspect-square size-8 items-center justify-center rounded bg-orange-600 p-2 text-xs font-medium text-white dark:bg-orange-500"
              aria-hidden="true"
            >
              UP
            </span>
            <div className="flex w-full items-center justify-between gap-x-4 truncate">
              <div className="truncate text-start">
                <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                  Up
                </p>
                <p className="whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                  Account
                </p>
              </div>
              <RiExpandUpDownLine
                className="size-5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          hidden={hasOpenDialog}
          onCloseAutoFocus={(event) => {
            if (focusRef.current) {
              focusRef.current.focus();
              focusRef.current = null;
              event.preventDefault();
            }
          }}
          className="min-w-[calc(var(--radix-dropdown-menu-trigger-width))] max-h-[var(--radix-popper-available-height)]"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Accounts ({accounts.length})</DropdownMenuLabel>
            {accounts.map((account) => (
              <DropdownMenuItem key={account.value}>
                <div className="flex w-full items-center gap-x-2.5">
                  <span
                    className={cn(
                      account.color,
                      'flex aspect-square size-8 items-center justify-center rounded p-2 text-xs font-medium text-white'
                    )}
                    aria-hidden="true"
                  >
                    {account.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {account.name}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-400">
                      {account.role}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ModalAddProvider
            onSelect={handleDialogItemSelect}
            onOpenChange={handleDialogItemOpenChange}
            itemName="Add account"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const ProviderDropdownMobile = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false);
  const dropdownTriggerRef = React.useRef<null | HTMLButtonElement>(null);
  const focusRef = React.useRef<null | HTMLButtonElement>(null);

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current;
  };

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open);
    if (open === false) {
      setDropdownOpen(false);
    }
  };
  return (
    <>
      {/* sidebar (xs-lg) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-x-1.5 rounded-md p-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-900">
            <span
              className={cn(
                'flex aspect-square size-7 items-center justify-center rounded bg-orange-600 p-2 text-xs font-medium text-white dark:bg-orange-500'
              )}
              aria-hidden="true"
            >
              UP
            </span>
            <RiArrowRightSLine
              className="size-4 shrink-0 text-gray-500"
              aria-hidden="true"
            />
            <div className="flex w-full items-center justify-between gap-x-3 truncate">
              <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                Up
              </p>
              <RiExpandUpDownLine
                className="size-4 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="!min-w-72"
          hidden={hasOpenDialog}
          onCloseAutoFocus={(event) => {
            if (focusRef.current) {
              focusRef.current.focus();
              focusRef.current = null;
              event.preventDefault();
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Accounts ({accounts.length})</DropdownMenuLabel>
            {accounts.map((account) => (
              <DropdownMenuItem key={account.value}>
                <div className="flex w-full items-center gap-x-2.5">
                  <span
                    className={cn(
                      account.color,
                      'flex size-8 items-center justify-center rounded p-2 text-xs font-medium text-white'
                    )}
                    aria-hidden="true"
                  >
                    {account.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {account.name}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {account.role}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ModalAddProvider
            onSelect={handleDialogItemSelect}
            onOpenChange={handleDialogItemOpenChange}
            itemName="Add account"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
