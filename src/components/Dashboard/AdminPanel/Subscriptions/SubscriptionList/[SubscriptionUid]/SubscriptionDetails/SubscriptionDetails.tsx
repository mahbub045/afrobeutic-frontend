"use client";
import { useGetSubscriptionDetailsQuery } from "@/Redux/Reducers/AdminPanel/Subscriptions/SubscriptionsApi";
import { useParams } from "next/navigation";

const SubscriptionDetails: React.FC = () => {
  const { subscriptionuid } = useParams();
  const {data: subscriptionDetailsData, isLoading} = useGetSubscriptionDetailsQuery({
    subscriptionUid: subscriptionuid,
  })
  
  return <div>{subscriptionuid}</div>;
};

export default SubscriptionDetails;
