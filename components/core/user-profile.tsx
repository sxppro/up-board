'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import { RiMore2Fill } from '@remixicon/react';
import { User } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserProfileDropdown } from './user-profile-dropdown';

interface UserProfileProps {
  user?: Pick<User, 'name' | 'image' | 'email'>;
}

export const UserProfileDesktop = ({ user }: UserProfileProps) => {
  return (
    <UserProfileDropdown user={user}>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cn(
          'group transition-all flex w-full items-center justify-between rounded-md p-2 text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10',
          focusRing
        )}
      >
        <span className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={`${user?.image}`} alt={`${user?.name}`} />
            <AvatarFallback>DE</AvatarFallback>
          </Avatar>
          <span>{user?.name || 'Demo'}</span>
        </span>
        <RiMore2Fill
          className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400"
          aria-hidden="true"
        />
      </Button>
    </UserProfileDropdown>
  );
};

export const UserProfileMobile = ({ user }: UserProfileProps) => {
  return (
    <UserProfileDropdown align="end" user={user}>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cn(
          'group flex items-center rounded-full p-1 text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10'
        )}
      >
        <Avatar className="size-8">
          <AvatarImage src={`${user?.image}`} alt={`${user?.name}`} />
          <AvatarFallback>DE</AvatarFallback>
        </Avatar>
      </Button>
    </UserProfileDropdown>
  );
};
