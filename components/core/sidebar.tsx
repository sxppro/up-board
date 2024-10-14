'use client';

import { siteConfig } from '@/app/siteConfig';
import { cn } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import {
  Bookmarks,
  ChartLine,
  Link as LinkIcon,
  ListBullets,
  Storefront,
  Tag,
  UserList,
} from '@phosphor-icons/react';
import { User } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MobileSidebar from './mobile-sidebar';
import {
  ProviderDropdownDesktop,
  ProviderDropdownMobile,
} from './sidebar-provider-dropdown';
import { UserProfileDesktop, UserProfileMobile } from './user-profile';

const navigation = [
  { name: 'Overview', href: siteConfig.baseLinks.home, icon: ChartLine },
  { name: 'Accounts', href: siteConfig.baseLinks.accounts, icon: UserList },
  {
    name: 'Categories',
    href: siteConfig.baseLinks.categories,
    icon: Bookmarks,
  },
  {
    name: 'Merchants',
    href: siteConfig.baseLinks.merchants,
    icon: Storefront,
  },
  {
    name: 'Transactions',
    href: siteConfig.baseLinks.transactions,
    icon: ListBullets,
  },
  {
    name: 'Tags',
    href: siteConfig.baseLinks.tags,
    icon: Tag,
  },
] as const;

const shortcuts = [
  {
    name: 'Add new user',
    href: '#',
    icon: LinkIcon,
  },
  {
    name: 'Workspace usage',
    href: '#',
    icon: LinkIcon,
  },
  {
    name: 'Cost spend control',
    href: '#',
    icon: LinkIcon,
  },
  {
    name: 'Overview – Rows written',
    href: '#',
    icon: LinkIcon,
  },
] as const;

interface SidebarProps {
  user?: Pick<User, 'name' | 'image' | 'email'>;
}

const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();
  const isActive = (itemHref: string) => pathname === itemHref;

  return (
    <>
      {/* sidebar (lg+) */}
      <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <aside className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <ProviderDropdownDesktop />
          <nav
            aria-label="core navigation links"
            className="flex flex-1 flex-col space-y-10"
          >
            <ul role="list" className="space-y-0.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      isActive(item.href)
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50',
                      'flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900',
                      focusRing
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <span className="text-xs font-medium leading-6 text-gray-500">
                Shortcuts
              </span>
              <ul aria-label="shortcuts" role="list" className="space-y-0.5">
                {shortcuts.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href || pathname.startsWith(item.href)
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50',
                        'flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900',
                        focusRing
                      )}
                    >
                      <item.icon
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <div className="mt-auto">
            <UserProfileDesktop user={user} />
          </div>
        </aside>
      </nav>
      {/* top navbar (xs-lg) */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-2 shadow-sm sm:gap-x-6 sm:px-4 lg:hidden dark:border-gray-800 dark:bg-gray-950">
        <ProviderDropdownMobile />
        <div className="flex items-center gap-1 sm:gap-2">
          <UserProfileMobile user={user} />
          <MobileSidebar />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
