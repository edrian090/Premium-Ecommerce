import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export const metadata = {
  title: "Admin Panel — E-Commerce Dashboard",
  description: "Manage your store, products, orders, and users from the admin control center.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <AdminSidebar />

      {/* Admin Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <AdminTopBar user={session.user} />

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
