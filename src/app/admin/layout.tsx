import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'IVAR STORE Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If no active session, render children directly so /admin/login works without redirection loop
  // The protected pages inside /admin will check requireAdmin or this layout will protect non-login routes
  return (
    <div className="min-h-screen bg-[#080D1A] text-white flex flex-col md:flex-row">
      {session ? (
        <>
          <AdminSidebar adminEmail={session.email} />
          <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
            {children}
          </main>
        </>
      ) : (
        <div className="w-full flex-1">
          {children}
        </div>
      )}
    </div>
  );
}
