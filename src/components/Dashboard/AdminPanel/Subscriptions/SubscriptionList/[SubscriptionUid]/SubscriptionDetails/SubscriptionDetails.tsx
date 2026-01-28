"use client";
import { useParams } from "next/navigation";

const SubscriptionDetails: React.FC = () => {
  const { subscriptionuid } = useParams();
  return <div>{subscriptionuid}sss</div>;
};

export default SubscriptionDetails;
