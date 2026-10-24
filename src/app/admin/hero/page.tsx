import { assertAdminOrRedirect } from '@/lib/auth';
import { getStoreSettings } from '@/lib/services/settings-service';
import HeroVideoManager from '@/components/admin/HeroVideoManager';

export const metadata = {
  title: 'Hero Video Settings | IVAR STORE Admin',
};

export const revalidate = 0;

export default async function AdminHeroPage() {
  await assertAdminOrRedirect();

  const settings = await getStoreSettings();

  return <HeroVideoManager initialSettings={settings} />;
}
