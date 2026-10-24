import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { getSafeClerkPublishableKey, isClerkConfigured } from '@/lib/clerk-config';
import AdminSignInRedirect from '@/components/auth/AdminSignInRedirect';
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
  const publishableKey = getSafeClerkPublishableKey();
  const authConfigured = isClerkConfigured();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        variables: {
          colorPrimary: '#00A3FF',
          colorBackground: '#111A2E',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'bg-[#111A2E] border border-[#1E2C4A] shadow-2xl rounded-2xl',
          formButtonPrimary:
            'bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-bold transition-all shadow-lg shadow-[#00A3FF]/20',
          headerTitle: 'text-white font-black',
          headerSubtitle: 'text-[#94A3B8]',
          socialButtonsBlockButton: 'bg-[#080D1A] border-[#1E2C4A] text-white hover:bg-[#1E2C4A]',
          formFieldInput: 'bg-[#080D1A] border-[#1E2C4A] text-white focus:border-[#00A3FF]',
          footerActionLink: 'text-[#00A3FF] hover:text-white',
        },
      }}
    >
      <html lang="en" className={`dark ${inter.variable}`}>
        <body className="min-h-screen bg-[#080D1A] text-[#F8FAFC] antialiased selection:bg-[#00A3FF] selection:text-black">
          <AdminSignInRedirect authConfigured={authConfigured} />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
