"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import MemberList from "./MemberList/MemberList";

const MembersPageContainer: React.FC = () => {
  return (
    <div>
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
