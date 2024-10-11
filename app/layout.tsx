import ThemeProvider from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { GeistSans } from 'geist/font/sans';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { siteConfig } from './siteConfig';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://upboard.app'),
  title: siteConfig.name,
  description: siteConfig.description,
  authors: [
    {
      name: 'Soppro',
      url: 'https://soppro.dev',
    },
  ],
  creator: 'Soppro',
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.className} antialiased dark:bg-gray-950`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
