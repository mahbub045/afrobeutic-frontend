import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSingleSalonDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import EditAllOpeningHoursDialog from "./Dialogs/EditAllOpeningHoursDialog";
import EditSingleOpeningHoursDialog from "./Dialogs/EditSingleOpeningHoursDialog";

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const extractMessage = (value: unknown): string | null => {
    if (!value) return null;

    if (typeof value === "string") {
      return value.trim() ? value : null;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const msg = extractMessage(item);
        if (msg) return msg;
      }
      return null;
    }

    if (typeof value === "object") {
      const record = value as Record<string, unknown>;

      const priorityKeys = ["message", "error", "detail", "non_field_errors"];

      for (const key of priorityKeys) {
        const msg = extractMessage(record[key]);
        if (msg) return msg;
      }

      for (const key of Object.keys(record)) {
        const msg = extractMessage(record[key]);
        if (msg) return msg;
      }
    }

    return null;
  };

  return extractMessage(error) ?? fallback;
};

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

const OpeningHours: React.FC = () => {
  const { data: session } = useSession();
  const { salonuid } = useParams();

  // RTK Hook - single salon data (which includes opening_hours)
  const {
    data: salonData,
    isLoading,
    isError,
    error,
  } = useGetSingleSalonDataQuery({ salonUid: salonuid });

  type OpeningEntry = {
    id: number;
    uid: string;
    day: string;
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
  };

  const openingHours: OpeningEntry[] = salonData?.opening_hours || [];

  // Sort using DAY_ORDER so UI is always Mon -> Sun
  const sorted = [...openingHours].sort((a: OpeningEntry, b: OpeningEntry) => {
    const ia = DAY_ORDER.indexOf(a.day);
    const ib = DAY_ORDER.indexOf(b.day);
    return ia - ib;
  });

  const [isEditAllOpen, setIsEditAllOpen] = useState(false);
  const [isEditSingleOpen, setIsEditSingleOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<OpeningEntry | null>(null);

  const onOpenEditSingle = (entry: OpeningEntry) => {
    setSelectedEntry(entry);
    setIsEditSingleOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-4 w-32" />
                </CardTitle>
                <div />
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Card className="flex gap-2 px-4 py-3">
                  <Skeleton className="h-3 w-4/12" />
                  <Skeleton className="h-3 w-1/2" />
                </Card>
                <Card className="flex gap-2 px-4 py-3">
                  <Skeleton className="h-3 w-4/12" />
                  <Skeleton className="h-3 w-1/2" />
                </Card>
                <Card className="flex gap-2 px-4 py-3">
                  <Skeleton className="h-3 w-4/12" />
                  <Skeleton className="h-3 w-1/2" />
                </Card>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = getApiErrorMessage(
      error,
      "There was a problem fetching opening hours. Try refreshing the page.",
    );

    return (
      <div className="rounded border border-red-100 bg-red-50 p-4">
        <h3 className="font-semibold text-red-700">
          Could not load opening hours
        </h3>
        <p className="text-sm text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Opening Hours</h2>
        <div className="flex items-center gap-2">
          {(session?.user?.role === "OWNER" ||
            session?.user?.role === "ADMIN") && (
            <Button
              size="sm"
              variant="outline"
              className="shadow-md dark:shadow-gray-600"
              onClick={() => setIsEditAllOpen(true)}
            >
              Edit All
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sorted.map((entry: OpeningEntry) => (
          <Card key={entry.uid} className="py-2 shadow-md dark:shadow-gray-600">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="relative">{entry.day}</CardTitle>
              <div className="flex items-center gap-2">
                {(session?.user?.role === "OWNER" ||
                  session?.user?.role === "ADMIN") && (
                  <Button
                    size="xs"
                    variant="outline"
                    className="shadow-md dark:shadow-gray-600"
                    onClick={() => onOpenEditSingle(entry)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!entry.is_closed ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Card className="flex flex-col gap-1 rounded-md px-4 py-2 shadow-md dark:shadow-gray-600">
                    <span className="text-xs font-medium opacity-80">
                      Opening
                    </span>
                    <span className="text-sm font-semibold">
                      {formatTimeShort(entry.opening_time)}
                    </span>
                  </Card>

                  <Card className="flex flex-col gap-1 rounded-md px-4 py-2 shadow-md dark:shadow-gray-600">
                    <span className="text-xs font-medium opacity-80">
                      Closing
                    </span>
                    <span className="text-sm font-semibold">
                      {formatTimeShort(entry.closing_time)}
                    </span>
                  </Card>
                </div>
              ) : (
                <Card className="text-warning/70 py-4 text-center text-sm shadow-md dark:shadow-gray-600">
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

      <EditAllOpeningHoursDialog
        singleSalonData={salonData || null}
        isOpen={isEditAllOpen}
        onClose={() => setIsEditAllOpen(false)}
      />
      <EditSingleOpeningHoursDialog
        singleSalonData={salonData || null}
        selectedOpening={selectedEntry}
        isOpen={isEditSingleOpen}
        onClose={() => setIsEditSingleOpen(false)}
      />
    </div>
  );
};

export default OpeningHours;
