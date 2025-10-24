import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetSingleSalonDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
function formatTimeShort(time?: string | null) {
  if (!time) return "--";
  // Expecting HH:MM:SS (24h) — return HH:MM without AM/PM
  const [hh, mm] = time.split(":");
  return `${String(hh).padStart(2, "0")}:${mm}`;
}

const OpeningHoursTab: React.FC = () => {
  const { salonuid } = useParams();
  const router = useRouter();

  // RTK Hook - single salon data (which includes opening_hours)
  const {
    data: salonData,
    isLoading,
    isError,
  } = useGetSingleSalonDataQuery({ salonUid: salonuid });

  type OpeningEntry = {
    id: number;
    uid: string;
    day: string;
    opening_start_time: string;
    opening_end_time: string;
    break_start_time: string;
    break_end_time: string;
    is_closed: boolean;
  };

  const openingHours: OpeningEntry[] = salonData?.opening_hours || [];

  // Sort using DAY_ORDER so UI is always Mon -> Sun
  const sorted = [...openingHours].sort((a: OpeningEntry, b: OpeningEntry) => {
    const ia = DAY_ORDER.indexOf(a.day);
    const ib = DAY_ORDER.indexOf(b.day);
    return ia - ib;
  });

  const onEdit = (entryUid?: string) => {
    if (!salonuid) return;
    // Navigate to a reasonable edit path. Adjust if your app uses a different route.
    router.push(
      `/dashboard/manage-salons/${salonuid}/opening-hours/edit/${entryUid}`,
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded-md bg-gray-100" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <CardTitle className="h-4 w-32 rounded bg-gray-200" />
                <div />
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded border border-red-100 bg-red-50 p-4">
        <h3 className="font-semibold text-red-700">
          Could not load opening hours
        </h3>
        <p className="text-sm text-red-600">
          There was a problem fetching opening hours. Try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Opening Hours</h2>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="secondary"
            className="shadow-md dark:shadow-gray-600"
            onClick={() =>
              router.push(
                `/dashboard/manage-salons/${salonuid}/opening-hours/edit`,
              )
            }
          >
            Edit All
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sorted.map((entry: OpeningEntry) => (
          <Card key={entry.uid}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{entry.day}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  className="shadow-md dark:shadow-gray-600"
                  variant={entry.is_closed ? "outline" : "default"}
                >
                  {entry.is_closed ? "Closed" : "Open"}
                </Badge>
                <Button
                  size="xs"
                  variant="outline"
                  className="shadow-md dark:shadow-gray-600"
                  onClick={() => onEdit(entry.uid)}
                >
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!entry.is_closed ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Card className="flex flex-col gap-1 rounded-md px-4 py-2 shadow-md dark:shadow-gray-600">
                    <span className="text-xs font-medium opacity-80">
                      Opening
                    </span>
                    <span className="text-sm font-semibold">
                      {formatTimeShort(entry.opening_start_time)}
                    </span>
                  </Card>

                  <Card className="flex flex-col gap-1 rounded-md px-4 py-2 shadow-md dark:shadow-gray-600">
                    <span className="text-xs font-medium opacity-80">
                      Break
                    </span>
                    <span className="text-sm font-semibold">
                      {entry.break_start_time &&
                      entry.break_end_time &&
                      entry.break_start_time !== "00:00:00"
                        ? `${formatTimeShort(entry.break_start_time)} - ${formatTimeShort(entry.break_end_time)}`
                        : "No break"}
                    </span>
                  </Card>

                  <Card className="flex flex-col gap-1 rounded-md px-4 py-2 shadow-md dark:shadow-gray-600">
                    <span className="text-xs font-medium opacity-80">
                      Closing
                    </span>
                    <span className="text-sm font-semibold">
                      {formatTimeShort(entry.opening_end_time)}
                    </span>
                  </Card>
                </div>
              ) : (
                <Card className="text-warning/70 py-5 text-sm text-center shadow-md dark:shadow-gray-600">
                  This day is marked as closed.
                </Card>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center justify-between"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OpeningHoursTab;
