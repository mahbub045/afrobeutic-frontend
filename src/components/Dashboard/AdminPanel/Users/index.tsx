"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import UserList from "./UserList/UserList";

const UsersContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Users",
            href: "/dashboard/admin-panel/users",
          },
        ]}
      />
      <UserList />
    </div>
  );
};

export default UsersContainer;
