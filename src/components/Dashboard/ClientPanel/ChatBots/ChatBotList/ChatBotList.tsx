"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetChatBotsQuery } from "@/Redux/Reducers/ClientPanel/ChatBots/ChatBotsApi";
import { ChatBot } from "@/Types/ClientPanel/ChatBots/ChatBotsTypes";
import { Bot } from "lucide-react";

type ChatBotsListResponse = {
  count?: number;
  results?: ChatBot[];
};

const getStatusBadge = (whatsappStatus?: string | null) => {
  switch (whatsappStatus) {
    case "ONLINE":
      return (
        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
          Online
        </Badge>
      );
    case "CREATING":
      return (
        <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
          Creating
        </Badge>
      );
    case "OFFLINE":
      return <Badge variant="secondary">Offline</Badge>;
    case "PENDING_VERIFICATION":
      return (
        <Badge className="bg-accent text-accent-foreground hover:bg-accent/80">
          Pending Verification
        </Badge>
      );
    case "VERIFYING":
      return (
        <Badge className="bg-accent text-accent-foreground hover:bg-accent/80">
          Verifying
        </Badge>
      );
    case "ONLINE_UPDATING":
      return (
        <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
          Updating
        </Badge>
      );
    case "TWILIO_REVIEW":
      return (
        <Badge className="bg-accent text-accent-foreground hover:bg-accent/80">
          Under Review
        </Badge>
      );
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "STUBBED":
      return <Badge variant="outline">Stubbed</Badge>;
    default:
      return <Badge variant="secondary">Not Connected</Badge>;
  }
};

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">ChatBots</h2>
          <p className="text-muted-foreground text-sm">
            Your WhatsApp chatbot connections and status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {isLoading ? "Loading…" : `${totalCount} total`}
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card
              key={`chatbot-skeleton-${idx}`}
              className="relative overflow-hidden border border-gray-200/60 bg-white/80 p-4 shadow-md dark:border-gray-700/60 dark:bg-gray-900/80"
            >
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <div className="space-y-2">
            <Bot className="text-muted-foreground/50 mx-auto h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              Something went wrong while loading chatbots.
            </p>
          </div>
        </div>
      ) : chatbots.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <div className="space-y-2">
            <Bot className="text-muted-foreground/50 mx-auto h-10 w-10" />
            <p className="text-muted-foreground text-sm">No chatbots yet</p>
            <p className="text-muted-foreground text-xs">
              Your created chatbots will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {chatbots.map((chatbot, idx) => (
            <Card
              key={`${chatbot.chatbot_name}-${idx}`}
              className="group hover:shadow-primary/10 relative overflow-hidden border border-gray-200/60 bg-white/80 p-4 shadow-md backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600 dark:hover:shadow-gray-600/30"
            >
              <div className="from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 pointer-events-none absolute inset-0 z-0 rounded-lg bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Bot className="text-primary h-5 w-5" />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge variant="outline" className="max-w-[180px] text-xs">
                    <span className="truncate">
                      Salon: {chatbot.salon || "-"}
                    </span>
                  </Badge>
                  <span className="shrink-0 text-xs">
                    {getStatusBadge(chatbot.status)}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-4 space-y-1">
                <h3 className="truncate text-base font-semibold">
                  {chatbot.chatbot_name}
                </h3>
                <p className="text-muted-foreground truncate text-sm">
                  {chatbot.whatsapp_sender_number || "-"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBotList;
