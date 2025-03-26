import '../styles/globals.css';

import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import React from 'react';

import { StoreProviders } from '@/components/StoreProviders';
import { ThemeProviders } from '@/components/ThemeProvider';
import { siteConfig } from '@/constants/siteConfig';

const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon/favicon-16x16.png',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/favicon-16x16.png',
  },
  manifest: `/favicon/site.webmanifest`,
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: [`${siteConfig.url}/images/og.jpg`],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/og.jpg`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='jp'>
      <body className={`${notoSansJP.variable} antialiased font-sans`}>
        <StoreProviders>
          <ThemeProviders>{children}</ThemeProviders>
        </StoreProviders>
      </body>
    </html>
  );
}
