"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatChoiceFieldValue } from "@/lib/utils";
import { useGetSalonListQuery } from "@/Redux/Reducers/AdminPanel/Accounts/Salons/SalonsApi";
import { SalonProps } from "@/Types/AdminPanel/AccountsTypes/SalonsTypes/SalonsType";
import { Bot, LoaderPinwheel } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const SalonsCard: React.FC = () => {
  const { accountuid } = useParams();
  const { data: salonList, isLoading } = useGetSalonListQuery({
    accountUid: accountuid,
  });

  const salons = salonList?.results ?? [];

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const parts = name.split(" ").filter(Boolean);
    const initials = (parts[0]?.charAt(0) ?? "") + (parts[1]?.charAt(0) ?? "");
    return initials.toUpperCase() || name.charAt(0).toUpperCase();
  };

  return (
    <Card className="h-full shadow-md dark:shadow-gray-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Salons</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg p-8">
            <LoaderPinwheel
              className="text-primary h-8 w-8 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">Loading salons…</span>
          </div>
        ) : salons.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <div className="space-y-2">
              <Bot className="text-muted-foreground/50 mx-auto h-10 w-10" />
              <p className="text-muted-foreground text-sm">No salons yet</p>
              <p className="text-muted-foreground text-xs">
                Add salons to track locations
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[340px] space-y-4 overflow-y-auto pr-2 pb-4">
            {salons?.map((salon: SalonProps) => (
              <Link
                key={salon.uid}
                href={`/admin/accounts/${accountuid}/salons/${salon.uid}`}
                className="block w-full"
                aria-label={`Open salon ${salon.name ?? salon.uid}`}
              >
                <div className="bg-card hover:bg-accent/50 group flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 shadow-md transition-colors dark:shadow-gray-600">
                  <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
                    {salon.logo ? (
                      <Image
                        src={salon.logo}
                        alt={salon.name ?? "salon"}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover"
                      />
                    ) : (
                      <span className="text-primary text-sm font-medium">
                        {getInitials(salon.name)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="truncate text-sm leading-none font-medium">
                        {salon.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {formatChoiceFieldValue(salon.status) ??
                          salon.status ??
                          "Unknown"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {salon.email ?? "No email provided"}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatChoiceFieldValue(salon.salon_type) ??
                        salon.salon_type}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalonsCard;
