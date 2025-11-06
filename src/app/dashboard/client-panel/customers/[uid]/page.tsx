import CustomerDetail from "@/components/Dashboard/ClientPanel/Customers/CustomerDetail/CustomerDetail";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";

interface CustomerDetailPageProps {
  params: Promise<{
    uid: string;
  }>;
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { uid } = await params;

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Customers",
            href: "/dashboard/client-panel/customers",
          },
          {
            label: "Customer Details",
            href: `/dashboard/client-panel/customers/${uid}`,
          },
        ]}
      />
      <CustomerDetail uid={uid} />
    </div>
  );
}
