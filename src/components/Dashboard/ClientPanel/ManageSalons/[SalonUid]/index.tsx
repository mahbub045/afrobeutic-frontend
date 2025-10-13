"use client";

import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";

const SingleSalonContainer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Manage Salons",
            href: "/dashboard/client-panel/manage-salons",
          },
          {
            label: "Single Salon",
            href: "/dashboard/client-panel/manage-salons/[SalonUid]",
          },
        ]}
      />
      <h1>Single Salon Page</h1>
      <p>This is a placeholder for the single salon details page.</p>
    </div>
  );
};

export default SingleSalonContainer;
