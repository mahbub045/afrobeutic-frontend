"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import TicketList from "./TicketList/TicketList";

const SupportTicketsContainer: React.FC = () => {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8">
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
