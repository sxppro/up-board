import { siteConfig } from '@/app/siteConfig';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import {
  ChartLine,
  Clock,
  CurrencyDollar,
  Link as LinkIcon,
  List,
  ListBullets,
  Storefront,
  UserList,
} from '@phosphor-icons/react';
import { Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Overview', href: siteConfig.baseLinks.home, icon: ChartLine },
  {
    name: 'Spending',
    href: siteConfig.baseLinks.spending,
    icon: CurrencyDollar,
  },
  { name: 'Accounts', href: siteConfig.baseLinks.accounts, icon: UserList },
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
  {
    name: 'History',
    href: siteConfig.baseLinks.history,
    icon: Clock,
  },
];

const shortcuts = [
  {
    name: 'Good Life',
    href: '/spending?category=good-life',
    icon: LinkIcon,
  },
];

export default function MobileSidebar() {
  const pathname = usePathname();
  const isActive = (itemHref: string) => pathname === itemHref;
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            aria-label="open sidebar"
            className="group flex items-center rounded-md size-10 text-sm font-medium hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10"
          >
            <List aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{siteConfig.name}</SheetTitle>
          </SheetHeader>

          <nav
            aria-label="mobile navigation links"
            className="flex flex-1 flex-col space-y-10"
          >
            <ul role="list" className="space-y-1.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive(item.href)
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50',
                        'flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900',
                        focusRing
                      )}
                    >
                      <item.icon
                        className="size-5 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
            <div>
              <span className="text-sm font-medium leading-6 text-gray-500 sm:text-xs">
                Shortcuts
              </span>
              <ul aria-label="shortcuts" role="list" className="space-y-0.5">
                {shortcuts.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href || pathname.includes(item.href)
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50',
                        'flex items-center gap-x-2.5 rounded-md px-2 py-1.5 font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900',
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
        </SheetContent>
      </Sheet>
    </>
  );
}
