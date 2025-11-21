import AdminPanelContainer from "@/components/Dashboard/AdminPanel/Home";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminPanel() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Get user role (stored top-level on user via auth.ts)
  const allowedRoles = ["MANAGEMENT_ADMIN", "MANAGEMENT_STAFF"];
  const role = session.user?.role;

  // Role-based access control - only MANAGEMENT_ADMIN and MANAGEMENT_STAFF can access
  if (!allowedRoles.includes(role || "")) {
    redirect("/auth/login?error=access_denied");
  }

  return <AdminPanelContainer />;
}
