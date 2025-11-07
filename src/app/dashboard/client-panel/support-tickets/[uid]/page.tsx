import TicketDetail from "@/components/Dashboard/ClientPanel/SupportTickets/TicketDetail/TicketDetail";

interface Props {
  params: { uid: string };
}

export default function TicketDetailPage({ params }: Props) {
  return <TicketDetail uid={params.uid} />;
}
