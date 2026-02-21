import BookingDetailsContainer from "@/components/Customer/Bookings/BookingList/[BookingUid]/index";

interface PageProps {
  params: {
    bookingUid: string;
  };
}

export default function BookingDetailsPage({ params }: PageProps) {
  return <BookingDetailsContainer />;
}
