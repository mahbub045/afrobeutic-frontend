"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import { useGetSubscriptionsQuery } from "@/Redux/Reducers/AdminPanel/Subscriptions/SubscriptionsApi";
import { SubscriptionTypes } from "@/Types/AdminPanel/SubscriptionsTypes/SubscriptionsTypes";
import {
  ChevronLeft,
  ChevronRight,
  LoaderPinwheel,
  Search,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const SubscriptionList: React.FC = () => {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [autoRenewFilter, setAutoRenewFilter] = useState<string>("ALL");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const {
    data: subscriptionsData,
    isLoading,
    isFetching,
  } = useGetSubscriptionsQuery({
    page: currentPage,
    search: debouncedSearch,
    status: statusFilter || undefined,
    auto_renew:
      autoRenewFilter !== "ALL" ? autoRenewFilter === "true" : undefined,
  });

  const subscriptions = subscriptionsData?.results ?? [];

  const statusColorMap = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "TRIAL":
        return "default";
      case "ACTIVE":
        return "secondary";
      case "EXPIRED":
        return "danger";
      case "CANCELLED":
        return "danger";
      default:
        return "outline";
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="text-lg font-semibold md:w-auto">Subscriptions</h2>

        <div className="relative flex-1 md:max-w-xs">
          <Search
            size={18}
            className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
          />
          <Input
            className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(s: string) => {
                setStatusFilter(s);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger
                size="sm"
                className="flex w-[190px] items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <SelectValue placeholder="Select a status" />
                </div>
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={autoRenewFilter}
              onValueChange={(v: string) => {
                setAutoRenewFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger
                size="sm"
                className="flex w-[190px] items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <SelectValue placeholder="Auto Renew" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Auto Renew All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(1);
                setSearchTerm("");
                setStatusFilter("");
                setAutoRenewFilter("ALL");
              }}
              className="!border !border-red-500 text-red-500 hover:!bg-red-500 hover:text-white"
            >
              <X />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary">Account</TableHead>
              <TableHead className="text-primary">Owner Email</TableHead>
              <TableHead className="text-primary text-center">Plan</TableHead>
              <TableHead className="text-primary text-center">Price</TableHead>
              <TableHead className="text-primary text-center">Status</TableHead>
              <TableHead className="text-primary text-center">
                Auto Renew
              </TableHead>
              <TableHead className="text-primary text-center">Start</TableHead>
              <TableHead className="text-primary text-center">End</TableHead>
              <TableHead className="text-primary text-center">
                Next Billing
              </TableHead>
              <TableHead className="text-primary text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <LoaderPinwheel className="text-primary mx-auto animate-spin" />
                </TableCell>
              </TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((s: SubscriptionTypes) => (
                <TableRow key={s.uid}>
                  <TableCell>{s.account?.name ?? "--"}</TableCell>
                  <TableCell>{s.account?.owner_email ?? "--"}</TableCell>
                  <TableCell className="text-center">
                    {s.pricing_plan?.name ?? "--"}
                  </TableCell>
                  <TableCell className="text-center">
                    ${s.pricing_plan?.price ?? "--"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusColorMap(s.status)}>
                      {formatChoiceFieldValue(s.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {s.auto_renew ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.start_date ? formatDateTime(s.start_date) : "--"}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.end_date ? formatDateTime(s.end_date) : "--"}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.next_billing_date
                      ? formatDateTime(s.next_billing_date)
                      : "--"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shadow-md dark:shadow-gray-600"
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <div className="text-muted-foreground mb-2 text-sm">
          Showing {subscriptions.length} results
        </div>
        {subscriptionsData &&
          subscriptionsData.count >
            (subscriptionsData.results?.length ?? 0) && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  subscriptionsData.previous &&
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                disabled={!subscriptionsData.previous || isFetching}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Page {currentPage} of{" "}
                  {subscriptionsData.count
                    ? Math.ceil(
                        subscriptionsData.count /
                          (subscriptionsData.results?.length || 1),
                      )
                    : 0}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  subscriptionsData.next && setCurrentPage((p) => p + 1)
                }
                disabled={!subscriptionsData.next || isFetching}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
      </div>
    </>
  );
};

export default SubscriptionList;
