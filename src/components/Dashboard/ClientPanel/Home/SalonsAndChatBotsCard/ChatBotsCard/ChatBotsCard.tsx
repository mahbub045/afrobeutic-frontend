"use client";
import { getWhatsAppStatusBadge } from "@/components/Dashboard/ClientPanel/CommonComponents/whatsapp-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetChatBotsQuery } from "@/Redux/Reducers/ClientPanel/ChatBots/ChatBotsApi";
import {
  ChatBot,
  ChatBotsListResponse,
} from "@/Types/ClientPanel/ChatBots/ChatBotsTypes";
import { Bot, Eye } from "lucide-react";
import Link from "next/link";

const ChatBotsCard: React.FC = () => {
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

  return (
    <Card className="h-full shadow-md dark:shadow-gray-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">My ChatBots</CardTitle>
        <Button variant="default" size="sm" asChild>
          <Link href="/dashboard/client-panel/chatbots">
            <Eye />
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <div className="space-y-2">
              <Bot className="text-muted-foreground/50 mx-auto h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                Loading chatbots...
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <div className="space-y-2">
              <Bot className="text-muted-foreground/50 mx-auto h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                Failed to load chatbots.
              </p>
            </div>
          </div>
        ) : chatbots.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <div className="space-y-2">
              <Bot className="text-muted-foreground/50 mx-auto h-10 w-10" />
              <p className="text-muted-foreground text-sm">No chatbots yet</p>
              <p className="text-muted-foreground text-xs">
                Click the Add button to create your first chatbot
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[340px] space-y-3 overflow-y-auto pr-2">
            {chatbots.slice(0, 5).map((chatbot: ChatBot, index: number) => (
              <div
                key={index}
                className="bg-card hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-4 shadow-md transition-colors dark:shadow-gray-600"
              >
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Bot className="text-primary h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="truncate text-sm font-semibold">
                      {chatbot?.chatbot_name}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="max-w-full text-xs">
                        <span className="truncate">
                          Salon: {chatbot?.salon || "-"}
                        </span>
                      </Badge>{" "}
                      <span className="shrink-0 text-xs">
                        {getWhatsAppStatusBadge(chatbot?.status)}
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground flex items-center gap-2 truncate text-xs">
                    <span className="truncate">
                      {chatbot?.whatsapp_number || "—"}
                    </span>
                    {chatbot?.message_limit != null && (
                      <span className="shrink-0 tabular-nums">
                        · Msgs {chatbot.remaining_messages ?? "—"}/
                        {chatbot.message_limit}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatBotsCard;
