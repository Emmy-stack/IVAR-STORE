import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAccountBySlug, getPublishedAccounts } from '@/lib/services/account-service';
import { getStoreSettings } from '@/lib/services/settings-service';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AccountDetailView from '@/components/accounts/AccountDetailView';
import SellAccountBanner from '@/components/home/SellAccountBanner';
import { formatNaira } from '@/lib/whatsapp';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const account = await getAccountBySlug(slug);

  if (!account || !account.published) {
    return {
      title: 'Account Not Found | IVAR STORE',
      description: 'The requested Free Fire account is not available.',
    };
  }

  const primaryImage =
    account.images?.find(img => img.is_primary)?.storage_path ||
    account.images?.[0]?.storage_path ||
    '/images/sample-acc-1.jpg';

  const priceFormatted = formatNaira(account.price);

  return {
    title: `${account.title} (${account.product_id}) | IVAR STORE`,
    description: `Buy ${account.title} - ${priceFormatted}. Level ${account.level || 'Max'}, Rank ${account.rank || 'Grandmaster'}. Instant WhatsApp transfer on IVAR STORE.`,
    openGraph: {
      title: `${account.title} - ${priceFormatted}`,
      description: account.description?.substring(0, 160),
      images: [{ url: primaryImage }],
    },
  };
}

export default async function AccountDetailsPage({ params }: Props) {
  const { slug } = await params;
  const [account, settings] = await Promise.all([
    getAccountBySlug(slug),
    getStoreSettings(),
  ]);

  if (!account || !account.published) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080D1A] text-white">
      <Navbar
        whatsappNumber={settings.whatsapp_number}
        telegramUrl={settings.telegram_url}
      />

      <main className="flex-1">
        <AccountDetailView
          account={account}
          whatsappNumber={settings.whatsapp_number}
        />

        <SellAccountBanner whatsappNumber={settings.whatsapp_number} />
      </main>

      <Footer
        whatsappNumber={settings.whatsapp_number}
        telegramNumber={settings.telegram_number}
        telegramUrl={settings.telegram_url}
      />
    </div>
  );
}
