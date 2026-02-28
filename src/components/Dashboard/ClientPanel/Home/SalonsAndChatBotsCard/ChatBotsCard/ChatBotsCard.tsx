"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetChatBotsQuery } from "@/Redux/Reducers/ClientPanel/Home/ChatBotsApi";
import { ChatBot } from "@/Types/ClientPanel/HomeTypes/ChatBotsTypes";
import { Bot } from "lucide-react";

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

const ChatBotsCard: React.FC = () => {
  const { data: chatBotsData, isLoading } = useGetChatBotsQuery(undefined);

  return (
    <Card className="h-full shadow-md dark:shadow-gray-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">My ChatBots</CardTitle>
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
        ) : chatBotsData && chatBotsData.length === 0 ? (
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
            {chatBotsData?.results?.map((chatbot: ChatBot, index: number) => (
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
                      {chatbot.chatbot_name}
                    </h4>
                    <span className="shrink-0 text-xs">
                      {getStatusBadge(chatbot.status)}
                    </span>
                  </div>

                  <p className="text-muted-foreground truncate text-xs">
                    {chatbot.whatsapp_sender_number}
                  </p>

                  <div className="pt-1">
                    <Badge variant="secondary" className="max-w-full text-xs">
                      <span className="truncate">
                        Salon: {chatbot.salon || "-"}
                      </span>
                    </Badge>
                  </div>
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
