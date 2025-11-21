"use client";

import { useGetManagementsListQuery } from "@/Redux/Reducers/AdminPanel/Managements/ManagementsApi";
import { useSession } from "next-auth/react";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";

const ManagementsContainer: React.FC = () => {
  const { data: session } = useSession();
  //   RTK Hook
  const { data: managementData, isLoading } =
    useGetManagementsListQuery(undefined);

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard/admin-panel" }]}
      />
    </div>
  );
};

export default ManagementsContainer;
