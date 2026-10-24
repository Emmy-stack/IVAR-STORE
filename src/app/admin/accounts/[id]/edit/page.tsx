import { notFound } from 'next/navigation';
import Link from 'next/link';
import { assertAdminOrRedirect } from '@/lib/auth';
import { getAccountById } from '@/lib/services/account-service';
import AccountForm from '@/components/admin/AccountForm';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function EditAccountPage({ params }: Props) {
  await assertAdminOrRedirect();

  const { id } = await params;
  const account = await getAccountById(id);

  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-[#1E2C4A]">
        <div>
          <Link
            href="/admin/accounts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Accounts</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Edit Account: {account.product_id}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Update account details, replace or reorder screenshots, or adjust availability.
          </p>
        </div>
      </div>

      <AccountForm initialAccount={account} />
    </div>
  );
}
