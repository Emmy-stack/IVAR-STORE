import { getPublishedAccounts } from '@/lib/services/account-service';
import { getStoreSettings } from '@/lib/services/settings-service';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import AccountListingSection from '@/components/accounts/AccountListingSection';
import SellAccountBanner from '@/components/home/SellAccountBanner';
import ContactSection from '@/components/home/ContactSection';

export const revalidate = 0; // Ensure live updates

export default async function HomePage() {
  const [settings, accounts] = await Promise.all([
    getStoreSettings(),
    getPublishedAccounts(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080D1A] text-white">
      {/* Navigation */}
      <Navbar
        whatsappNumber={settings.whatsapp_number}
        telegramUrl={settings.telegram_url}
      />

      <main className="flex-1">
        {/* Hero Section with Video/Poster */}
        <HeroSection
          title={settings.hero_title}
          subtitle={settings.hero_subtitle}
          videoUrl={settings.hero_video_url}
          posterUrl={settings.hero_poster_url}
          videoEnabled={settings.hero_video_enabled}
          whatsappNumber={settings.whatsapp_number}
        />

        {/* Available Accounts Listings Grid with Filters & Search */}
        <AccountListingSection initialAccounts={accounts} />

        {/* Sell Your Account Middle Banner */}
        <SellAccountBanner whatsappNumber={settings.whatsapp_number} />

        {/* Contact & Support Section */}
        <ContactSection
          whatsappNumber={settings.whatsapp_number}
          telegramNumber={settings.telegram_number}
          telegramUrl={settings.telegram_url}
        />
      </main>

      {/* Footer */}
      <Footer
        whatsappNumber={settings.whatsapp_number}
        telegramNumber={settings.telegram_number}
        telegramUrl={settings.telegram_url}
      />
    </div>
  );
}
