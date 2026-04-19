"use client";

import * as React from "react";

import type {
  BillingHistoryItem,
  PaginatedResponse,
} from "@/Types/ClientPanel/Accounts/BillingTypes";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatChoiceFieldValue,
  formatDateTime,
  formatPrice,
} from "@/lib/utils";

type Props = {
  data: PaginatedResponse<BillingHistoryItem>;
  page: number;
  onPageChange: (page: number) => void;
};

const parsePageFromUrl = (url: string | null): number | null => {
  if (!url) return null;

  try {
    const parsed = new URL(
      url,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );
    const pageParam = parsed.searchParams.get("page");
    if (!pageParam) return null;
    const page = Number(pageParam);
    return Number.isFinite(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
};

const getTransactionStatusVariant = (
  status?: string | null,
): React.ComponentProps<typeof Badge>["variant"] => {
  const normalized = (status ?? "").trim().toUpperCase();

  if (
    ["PAID", "SUCCESS", "SUCCEEDED", "VALID", "COMPLETED"].includes(normalized)
  )
    return "default";
  if (["PENDING", "PROCESSING", "REQUIRES_ACTION"].includes(normalized))
    return "warning";
  if (
    ["FAILED", "INVALID", "ERROR", "CANCELLED", "CANCELED"].includes(normalized)
  )
    return "danger";

  return "secondary";
};

const BillingHistoryCard: React.FC<Props> = ({ data, page, onPageChange }) => {
  const results = data?.results ?? [];

  const nextPage =
    parsePageFromUrl(data?.next) ?? (data?.next ? page + 1 : null);
  const previousPage =
    parsePageFromUrl(data?.previous) ??
    (data?.previous ? Math.max(1, page - 1) : null);

  const canGoNext = Boolean(data?.next) && nextPage !== null;
  const canGoPrevious = Boolean(data?.previous) && previousPage !== null;

  const goToPage = (target: number | null) => {
    if (!target || target < 1) return;
    if (target === page) return;
    onPageChange(target);
  };

  const showPagination = Boolean(data?.next || data?.previous);

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="space-y-1">
          <CardTitle>Billing history</CardTitle>
          <CardDescription>
            {typeof data?.count === "number"
              ? `${data.count} record(s)`
              : "Recent transactions"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No billing history yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row, idx) => {
                const invoiceUrl = row.invoice_url ?? null;
                const statusLabel = formatChoiceFieldValue(
                  row.transaction_status,
                );

                return (
                  <TableRow key={`${row.created_at}-${idx}`}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium">
                      {formatChoiceFieldValue(row.plan_name) || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getTransactionStatusVariant(
                          row.transaction_status,
                        )}
                      >
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(row.amount)}</TableCell>
                    <TableCell>{formatDateTime(row.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {invoiceUrl ? (
                        <a
                          href={invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
      </CardContent>
    </Card>
  );
};

export default BillingHistoryCard;
