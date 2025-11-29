"use client";
import { useParams } from "next/navigation";

const Products: React.FC = () => {
  const { accountuid, salonuid } = useParams();
  return <div>{/* JSX here */}</div>;
};

export default Products;
