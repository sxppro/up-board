'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import { RiMore2Fill } from '@remixicon/react';
import { UserProfileDropdown } from './user-profile-dropdown';

export const UserProfileDesktop = () => {
  return (
    <UserProfileDropdown>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cn(
          'group transition-all flex w-full items-center justify-between rounded-md p-2 text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10',
          focusRing
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
            aria-hidden="true"
          >
            ES
          </span>
          <span>Emma Stone</span>
        </span>
        <RiMore2Fill
          className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400"
          aria-hidden="true"
        />
      </Button>
    </UserProfileDropdown>
  );
};

export const UserProfileMobile = () => {
  return (
    <UserProfileDropdown align="end">
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cn(
          'group flex items-center rounded-md p-1 text-sm font-medium text-gray-900 hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10'
        )}
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
          aria-hidden="true"
        >
          ES
        </span>
      </Button>
    </UserProfileDropdown>
  );
};
