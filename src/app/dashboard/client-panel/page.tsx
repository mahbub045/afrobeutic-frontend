import ClientPanelContainer from "@/components/Dashboard/ClientPanel";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ClientPanel() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Role-based access control - only owner, admin, staff can access
  const allowedRoles = ["OWNER", "ADMIN", "STAFF"];
  if (!allowedRoles.includes(session.user?.role as string)) {
    redirect("/auth/login?error=access_denied");
  }

  return <ClientPanelContainer />;
}
