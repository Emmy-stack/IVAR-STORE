import { getPublishedAccounts } from '@/lib/services/account-service';
import { getStoreSettings } from '@/lib/services/settings-service';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AccountListingSection from '@/components/accounts/AccountListingSection';
import SellAccountBanner from '@/components/home/SellAccountBanner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'All Free Fire Accounts | IVAR STORE',
  description: 'Search and filter authentic Free Fire accounts in Nigeria. Evo guns, rare Sakura bundles, Grandmaster ranks.',
};

export default async function AccountsPage() {
  const [settings, accounts] = await Promise.all([
    getStoreSettings(),
    getPublishedAccounts(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080D1A] text-white">
      <Navbar
        whatsappNumber={settings.whatsapp_number}
        telegramUrl={settings.telegram_url}
      />

      <main className="flex-1 pt-6">
        <AccountListingSection initialAccounts={accounts} />
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
