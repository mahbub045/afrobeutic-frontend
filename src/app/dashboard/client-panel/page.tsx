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

  return (
    <main className="min-h-screen bg-gray-50 p-8 dark:bg-black">
      <h1 className="text-3xl font-bold">Client Panel</h1>
      <div className="mt-4 space-y-2">
        <p>Hello, {session.user?.email || "User"}</p>
        <p>Role: {session.user?.role || "N/A"}</p>
        <p>
          Name: {session.user?.first_name} {session.user?.last_name}
        </p>
        <p>Country: {session.user?.country || "N/A"}</p>
      </div>
    </main>
  );
}
