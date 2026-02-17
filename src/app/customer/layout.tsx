import CustomerLayoutComponent from "@/components/Layout/CustomerLayout/CustomerLayoutComponent";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerLayoutComponent>{children}</CustomerLayoutComponent>;
}
