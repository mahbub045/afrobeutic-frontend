"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import MemberList from "./MemberList/MemberList";

const MembersPageContainer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Members",
            href: "/dashboard/client-panel/members",
          },
        ]}
      />
      <MemberList />
    </div>
  );
};

export default MembersPageContainer;
