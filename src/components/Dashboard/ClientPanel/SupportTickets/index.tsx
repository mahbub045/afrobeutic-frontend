"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import TicketList from "./TicketList/TicketList";

const SupportTicketsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Support Tickets",
            href: "/dashboard/client-panel/support-tickets",
          },
        ]}
      />
      <TicketList />
    </div>
  );
};

export default SupportTicketsContainer;
