import { useGetUserDetailsQuery } from "@/Redux/Reducers/AdminPanel/Users/UsersApi";
import { useParams } from "next/navigation";

const UserDetails: React.FC = () => {
  const { useruid } = useParams();
  const {
    data: userDetails,
    isLoading,
    isFetching,
  } = useGetUserDetailsQuery({ userUid: useruid });

  console.log("Details:::", userDetails)

  return <div>{/* JSX here */}</div>;
};

export default UserDetails;

