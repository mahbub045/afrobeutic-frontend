import DashboardLayoutClient from "@/components/Layout/DashboardLayoutClient";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/auth/login");
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
