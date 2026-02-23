import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import BookingList from "./BookingList/BookingList";

const BookingsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Bookings", href: "/customer/bookings" }]}
      />
      <BookingList />
    </div>
  );
};

export default BookingsContainer;
