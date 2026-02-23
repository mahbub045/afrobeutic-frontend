import Breadcrumbs from "@/components/Customer/Breadcrumbs/Breadcrumbs";
import BookingDetails from "./BookingDetails/BookingDetails";

const BookingDetailsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Bookings", href: "/customer/bookings" },
          { label: "Booking Details", href: "#" },
        ]}
      />
      <BookingDetails />
    </div>
  );
};

export default BookingDetailsContainer;
