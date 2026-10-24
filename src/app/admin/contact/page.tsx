import { assertAdminOrRedirect } from '@/lib/auth';
import { getStoreSettings } from '@/lib/services/settings-service';
import ContactSettingsManager from '@/components/admin/ContactSettingsManager';

export const metadata = {
  title: 'Contact Settings | IVAR STORE Admin',
};

export const revalidate = 0;

export default async function AdminContactPage() {
  await assertAdminOrRedirect();

  const settings = await getStoreSettings();

  return <ContactSettingsManager initialSettings={settings} />;
}
