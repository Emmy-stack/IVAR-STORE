import { assertAdminOrRedirect } from '@/lib/auth';
import { getAllAccountsAdmin } from '@/lib/services/account-service';
import ManageAccountsView from '@/components/admin/ManageAccountsView';

export const metadata = {
  title: 'Manage Accounts | IVAR STORE Admin',
};

export const revalidate = 0;

export default async function AdminAccountsPage() {
  await assertAdminOrRedirect();

  const accounts = await getAllAccountsAdmin();

  return <ManageAccountsView initialAccounts={accounts} />;
}
