"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatChoiceFieldValue } from "@/lib/utils";
import { useGetAddCardListQuery } from "@/Redux/Reducers/ClientPanel/Accounts/Billing/BillingApi";
import type {
  PaginatedResponse,
  SavedCardItem,
} from "@/Types/ClientPanel/Accounts/BillingTypes";
import { Plus } from "lucide-react";
import BillingErrorAlert from "./BillingErrorAlert";

const parsePageFromUrl = (url: string | null): number | null => {
  if (!url) return null;

  try {
    const query = url.includes("?") ? (url.split("?")[1] ?? "") : "";
    const queryWithoutHash = query.includes("#")
      ? (query.split("#")[0] ?? "")
      : query;
    const pageParam = new URLSearchParams(queryWithoutHash).get("page");
    if (!pageParam) return null;
    const page = Number(pageParam);
    return Number.isFinite(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
};

const EmptyState: React.FC = () => {
  return (
    <div className="text-muted-foreground text-sm">No saved cards yet.</div>
  );
};

const LoadingState: React.FC = () => {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-9 w-44" />
        </div>
      </CardContent>
    </Card>
  );
};

const PaymentMethodTile: React.FC<{ card: SavedCardItem }> = ({ card }) => {
  const brandLabel = formatChoiceFieldValue(card.card_brand).toUpperCase();
  const expiryMonth = String(card.expiry_month).padStart(2, "0");
  const expiryYear = String(card.expiry_year);

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge className="border-transparent bg-black p-2">
            {brandLabel}
          </Badge>
          <div className="space-y-1">
            <div className="font-semibold tracking-tight">
              ••••{card.last_four}
            </div>
            <div className="text-muted-foreground text-sm">
              Expires {expiryMonth}/{expiryYear}
            </div>
          </div>
        </div>

        {card.is_default ? (
          <Badge className="bg-muted text-foreground border-transparent">
            Default
          </Badge>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between">
        {!card.is_default ? (
          <Button size="sm" variant="outline">
            Set as default
          </Button>
        ) : (
          <span />
        )}

        <Button size="sm" variant="danger">
          Delete
        </Button>
      </div>
    </div>
  );
};

const PaymentMethodsCard: React.FC = () => {
  const [page, setPage] = React.useState(1);

  const params = React.useMemo(() => ({ page }), [page]);

  const { data, isLoading, isError, isFetching, refetch } =
    useGetAddCardListQuery(params);

  if (isLoading) return <LoadingState />;
  if (isError) return <BillingErrorAlert onRetry={() => refetch()} />;

  const payload = data as PaginatedResponse<SavedCardItem> | undefined;
  const results = payload?.results ?? [];

  const nextPage =
    parsePageFromUrl(payload?.next ?? null) ??
    (payload?.next ? page + 1 : null);
  const previousPage =
    parsePageFromUrl(payload?.previous ?? null) ??
    (payload?.previous ? Math.max(1, page - 1) : null);

  const canGoNext = Boolean(payload?.next) && nextPage !== null;
  const canGoPrevious = Boolean(payload?.previous) && previousPage !== null;
  const showPagination = Boolean(payload?.next || payload?.previous);

  const goToPage = (target: number | null) => {
    if (!target || target < 1) return;
    if (target === page) return;
    setPage(target);
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Payment methods</CardTitle>
            <CardDescription>
              {typeof payload?.count === "number"
                ? `${payload.count} card(s)`
                : "Saved cards"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {results.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((card) => (
              <PaymentMethodTile key={card.uid} card={card} />
            ))}
          </div>
        )}

        {showPagination ? (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(previousPage);
                    }}
                    className={
                      !canGoPrevious
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                    size="default"
                    onClick={(e) => e.preventDefault()}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(nextPage);
                    }}
                    className={
                      !canGoNext ? "pointer-events-none opacity-50" : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}

        <div className="mt-6">
          <Button variant="outline" disabled={isFetching}>
            <Plus />
            Add payment method
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsCard;
