import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminPanel() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Get user role (stored top-level on user via auth.ts)
  const role = session.user?.role;

  // Role-based access control - only MANAGEMENT_ADMIN and MANAGEMENT_STAFF can access
  if (role !== "MANAGEMENT_ADMIN" && role !== "MANAGEMENT_STAFF") {
    redirect("/auth/login?error=access_denied");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 dark:bg-black">
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard/admin-panel" }]}
      />
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <div className="mt-4 space-y-2">
        <p>Welcome, {session.user?.email || "User"}</p>
        <p>Role: {role || "N/A"}</p>
        <p>
          Name: {session.user?.first_name} {session.user?.last_name}
        </p>
        <p>Country: {session.user?.country || "N/A"}</p>
      </div>
    </main>
  );
}
