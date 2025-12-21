import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetSalonOverviewQuery } from "@/Redux/Reducers/AdminPanel/Accounts/Salons/SalonsApi";
import {
  Armchair,
  BookOpen,
  DollarSign,
  LoaderPinwheel,
  Package,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { useParams } from "next/navigation";

const SalonOverviews: React.FC = () => {
  const { accountuid, salonuid } = useParams();
  const { data: salonOverview, isLoading } = useGetSalonOverviewQuery({
    accountUid: accountuid,
    salonUid: salonuid,
  });

  const StatCard = ({
    icon: Icon,
    label,
    value,
    isLoading: cardLoading,
    colorClass,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    isLoading: boolean;
    colorClass: string;
  }) => (
    <Card
      className={`flex flex-col shadow-md dark:shadow-gray-600 ${colorClass}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white">
            {label}
          </CardTitle>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {cardLoading ? (
          <LoaderPinwheel className="animate-spin text-white" />
        ) : (
          <div className="text-3xl font-bold text-white">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  const stats = [
    {
      icon: BookOpen,
      label: "Total Bookings",
      value: salonOverview?.total_bookings ?? 0,
      color:
        "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-950 dark:to-blue-900",
    },
    {
      icon: DollarSign,
      label: "Booking Revenue",
      value: `$${salonOverview?.total_booking_revenue?.toFixed(2) ?? "0.00"}`,
      color:
        "bg-gradient-to-br from-green-500 to-green-600 dark:from-green-950 dark:to-green-900",
    },
    {
      icon: Users,
      label: "Total Employees",
      value: salonOverview?.total_employees ?? 0,
      color:
        "bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-950 dark:to-purple-900",
    },
    {
      icon: Package,
      label: "Total Products",
      value: salonOverview?.total_products ?? 0,
      color:
        "bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-950 dark:to-orange-900",
    },
    {
      icon: Wrench,
      label: "Total Services",
      value: salonOverview?.total_services ?? 0,
      color:
        "bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-950 dark:to-pink-900",
    },
    {
      icon: User,
      label: "Total Customers",
      value: salonOverview?.total_customers ?? 0,
      color:
        "bg-gradient-to-br from-cyan-500 to-cyan-600 dark:from-cyan-950 dark:to-cyan-900",
    },
    {
      icon: Armchair,
      label: "Total Chairs",
      value: salonOverview?.total_chairs ?? 0,
      color:
        "bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-950 dark:to-indigo-900",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Salon Overview</h2>
        <p className="text-muted-foreground text-sm">
          Key metrics and statistics for your salon
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.slice(0, 4).map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            isLoading={isLoading}
            colorClass={stat.color}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.slice(4).map((stat, index) => (
          <StatCard
            key={index + 4}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            isLoading={isLoading}
            colorClass={stat.color}
          />
        ))}
      </div>
    </div>
  );
};

export default SalonOverviews;
