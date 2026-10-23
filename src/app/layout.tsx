import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'IVAR STORE — Nigeria’s #1 Free Fire Account Marketplace',
  description:
    'Buy and sell authentic Free Fire accounts with rare bundles, max evo guns, and Grandmaster ranks. Verified WhatsApp escrow handover and fast delivery.',
  keywords: [
    'Free Fire accounts Nigeria',
    'Buy FF account',
    'Sell FF account Nigeria',
    'IVAR STORE Free Fire',
    'Grandmaster account',
    'Evo gun max',
    'Sakura bundle Free Fire',
  ],
  authors: [{ name: 'IVAR STORE' }],
  openGraph: {
    title: 'IVAR STORE — Free Fire Account Marketplace',
    description:
      'Find your next legendary Free Fire account. Verified WhatsApp escrow delivery in Nigeria.',
    siteName: 'IVAR STORE',
    images: [
      {
        url: '/images/hero-poster.jpg',
        width: 1200,
        height: 630,
        alt: 'IVAR STORE Free Fire Marketplace',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-[#080D1A] text-[#F8FAFC] antialiased selection:bg-[#00A3FF] selection:text-black">
        {children}
      </body>
    </html>
  );
}
