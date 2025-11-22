"use client";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import UserDetails from "./UserDetails/UserDetails";

const UserDetailsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Users",
            href: "/dashboard/admin-panel/users",
          },
          { label: "User Details", href: "#" },
        ]}
      />
      <UserDetails />
    </div>
  );
};

export default UserDetailsContainer;
