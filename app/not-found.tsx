import { Button } from '@/components/ui/button';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { siteConfig } from './siteConfig';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <p className="mt-6 text-4xl font-semibold sm:text-5xl">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Button asChild className="group mt-8" variant="ghost">
        <Link href={siteConfig.baseLinks.home}>
          Go to the home page
          <ArrowRight
            className="ml-1 size-5 text-gray-900 dark:text-gray-50"
            aria-hidden="true"
          />
        </Link>
      </Button>
    </div>
  );
}
