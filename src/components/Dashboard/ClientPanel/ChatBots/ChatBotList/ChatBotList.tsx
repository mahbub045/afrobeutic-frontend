"use client";
import { getWhatsAppStatusBadge } from "@/components/Dashboard/ClientPanel/CommonComponents/whatsapp-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetChatBotsQuery } from "@/Redux/Reducers/ClientPanel/ChatBots/ChatBotsApi";
import {
  ChatBot,
  ChatBotsListResponse,
} from "@/Types/ClientPanel/ChatBots/ChatBotsTypes";
import { AlertTriangle, Bot, MessageSquare, Phone, Store } from "lucide-react";

/** Returns a 0-100 percentage of messages used (100 = all used up). */
function usagePercent(remaining?: number | null, limit?: number | null) {
  if (!limit || limit <= 0) return 0;
  const used = limit - (remaining ?? 0);
  return Math.min(100, Math.max(0, Math.round((used / limit) * 100)));
}

/** Tailwind colour classes for the progress bar based on remaining ratio. */
function barColor(remaining?: number | null, limit?: number | null) {
  if (!limit || limit <= 0) return "bg-gray-300";
  const ratio = (remaining ?? 0) / limit;
  if (ratio > 0.5) return "bg-emerald-500";
  if (ratio > 0.2) return "bg-amber-400";
  return "bg-rose-500";
}

/** Left-border accent colour keyed to WhatsApp status. */
function statusAccent(status?: string | null) {
  switch (status?.toUpperCase()) {
    case "ONLINE":
      return "border-l-emerald-500";
    case "OFFLINE":
      return "border-l-gray-400";
    case "CREATING":
    case "ONLINE_UPDATING":
      return "border-l-blue-500";
    case "PENDING_VERIFICATION":
    case "VERIFYING":
      return "border-l-amber-400";
    case "TWILIO_REVIEW":
      return "border-l-orange-500";
    case "DRAFT":
    case "STUBBED":
      return "border-l-purple-500";
    default:
      return "border-l-gray-300";
  }
}

const ChatBotList = () => {
  const {
    data: chatBotsData,
    isLoading,
    isError,
  } = useGetChatBotsQuery(undefined);

  const normalized = chatBotsData as
    | ChatBotsListResponse
    | ChatBot[]
    | undefined;
  const chatbots = Array.isArray(normalized)
    ? normalized
    : (normalized?.results ?? []);
  const totalCount = Array.isArray(normalized)
    ? normalized.length
    : (normalized?.count ?? chatbots.length);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">ChatBots</h2>
          <p className="text-muted-foreground text-sm">
            Your WhatsApp chatbot connections and status.
          </p>
        </div>

        {!isLoading && (
          <Badge
            variant="secondary"
            className="w-fit gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          >
            <Bot className="h-3.5 w-3.5" />
            {totalCount} {totalCount === 1 ? "chatbot" : "chatbots"}
          </Badge>
        )}
      </div>

      {/* ── Loading ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card
              key={`chatbot-skeleton-${idx}`}
              className="overflow-hidden border-l-4 border-l-gray-200 p-5 dark:border-l-gray-700"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="mt-5 space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : /* ── Error ── */
      isError ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-rose-200 bg-rose-50/40 p-10 text-center dark:border-rose-800/40 dark:bg-rose-900/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
            <AlertTriangle className="h-7 w-7 text-rose-500" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-rose-700 dark:text-rose-400">
              Failed to load chatbots
            </p>
            <p className="text-muted-foreground text-xs">
              Something went wrong. Please refresh and try again.
            </p>
          </div>
        </div>
      ) : /* ── Empty ── */
      chatbots.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Bot className="text-muted-foreground h-7 w-7" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No chatbots yet</p>
            <p className="text-muted-foreground text-xs">
              Your created chatbots will appear here.
            </p>
          </div>
        </div>
      ) : (
        /* ── Cards ── */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {chatbots.map((chatbot, idx) => {
            const used = usagePercent(
              chatbot.remaining_messages,
              chatbot.message_limit,
            );
            const bar = barColor(
              chatbot.remaining_messages,
              chatbot.message_limit,
            );

            return (
              <Card
                key={`${chatbot.chatbot_name}-${idx}`}
                className={`group relative flex flex-col overflow-hidden border-l-4 bg-white/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/80 ${statusAccent(chatbot.status)}`}
              >
                {/* Top row: icon + status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="bg-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md dark:shadow-gray-600">
                    <Bot className="text-primary h-5 w-5" />
                  </div>
                  {getWhatsAppStatusBadge(chatbot.status)}
                </div>

                {/* Title */}
                <div className="mt-2 flex-1 space-y-3">
                  <h3
                    className="truncate text-base leading-tight font-semibold"
                    title={chatbot.chatbot_name}
                  >
                    {chatbot.chatbot_name}
                  </h3>

                  {/* Salon */}
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Store className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{chatbot.salon || "—"}</span>
                  </div>

                  {/* Phone number */}
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate font-mono">
                      {chatbot.whatsapp_number || "—"}
                    </span>
                  </div>
                </div>

                {/* Message usage */}
                <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      Messages
                    </span>
                    <span className="text-xs font-medium tabular-nums">
                      {chatbot.remaining_messages ?? "—"}&nbsp;/&nbsp;
                      {chatbot.message_limit ?? "—"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bar}`}
                      style={{ width: `${used}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground text-right text-[10px]">
                    {used}% used
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatBotList;
