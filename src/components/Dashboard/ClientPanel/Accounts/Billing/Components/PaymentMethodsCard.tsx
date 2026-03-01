"use client";
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
import {
  useGetAddCardListQuery,
  useSetAsDefaultCardMutation,
} from "@/Redux/Reducers/ClientPanel/Accounts/Billing/BillingApi";
import type {
  PaginatedResponse,
  SavedCardItem,
} from "@/Types/ClientPanel/Accounts/BillingTypes";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "react-toastify";
import BillingErrorAlert from "./BillingErrorAlert";
import AddPaymentMethodDialog from "./Dialogs/AddPaymentMethodDialog";
import DeletePaymentMethodDialog from "./Dialogs/DeletePaymentMethodDialog";

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
    <Card className="shadow-md dark:shadow-gray-600">
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

const PaymentMethodTile: React.FC<{
  card: SavedCardItem;
  onDelete: (card: SavedCardItem) => void;
  onSetDefault: (card: SavedCardItem) => void;
  isSettingDefault?: boolean;
}> = ({ card, onDelete, onSetDefault, isSettingDefault }) => {
  const brandLabel = formatChoiceFieldValue(card.card_brand).toUpperCase();
  const expiryMonth = String(card.expiry_month).padStart(2, "0");
  const expiryYear = String(card.expiry_year);

  return (
    <Card className="p-2 shadow-md dark:shadow-gray-600">
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

      <div className="flex items-center justify-between">
        {!card.is_default ? (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => onSetDefault(card)}
            disabled={isSettingDefault}
          >
            {isSettingDefault ? "Setting..." : "Set as default"}
          </Button>
        ) : (
          <span />
        )}

        <Button
          type="button"
          size="xs"
          variant="danger"
          onClick={() => onDelete(card)}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};

const PaymentMethodsCard: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<SavedCardItem | null>(
    null,
  );
  const [settingDefaultUid, setSettingDefaultUid] = React.useState<
    string | null
  >(null);

  const params = React.useMemo(() => ({ page }), [page]);

  const {
    data: cardListData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetAddCardListQuery(params);

  const [setAsDefaultCard] = useSetAsDefaultCardMutation();

  const payload = cardListData as PaginatedResponse<SavedCardItem> | undefined;
  const results = (payload?.results ?? [])
    .map((card, index) => ({ card, index }))
    .sort((a, b) => {
      const aDefault = a.card.is_default ? 1 : 0;
      const bDefault = b.card.is_default ? 1 : 0;
      if (aDefault !== bDefault) return bDefault - aDefault;
      return a.index - b.index;
    })
    .map((x) => x.card);

  if (isLoading) return <LoadingState />;
  if (isError) return <BillingErrorAlert onRetry={() => refetch()} />;

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

  const handleSetDefault = async (card: SavedCardItem) => {
    if (card.is_default) return;

    try {
      setSettingDefaultUid(card.uid);

      const formData = new FormData();
      formData.append("is_default", "true");

      await setAsDefaultCard({
        card_uid: card.uid,
        payload: formData,
      }).unwrap();
      toast.success("Default payment method updated.");
      refetch();
    } catch (e) {
      console.error(e);
      const message =
        (e as { data?: { message?: string } })?.data?.message ||
        "Failed to set default payment method. Please try again.";
      toast.error(message);
    } finally {
      setSettingDefaultUid(null);
    }
  };

  return (
    <Card className="shadow-md dark:shadow-gray-600">
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
              <PaymentMethodTile
                key={card.uid}
                card={card}
                onDelete={(target) => {
                  setSelectedCard(target);
                  setDeleteDialogOpen(true);
                }}
                onSetDefault={handleSetDefault}
                isSettingDefault={settingDefaultUid === card.uid}
              />
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
          <Button
            size="sm"
            variant="default"
            disabled={isFetching}
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus />
            Add payment method
          </Button>
        </div>

        <AddPaymentMethodDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={() => {
            refetch();
          }}
        />

        <DeletePaymentMethodDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setSelectedCard(null);
          }}
          card={selectedCard}
          onSuccess={() => {
            refetch();
          }}
        />
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsCard;
