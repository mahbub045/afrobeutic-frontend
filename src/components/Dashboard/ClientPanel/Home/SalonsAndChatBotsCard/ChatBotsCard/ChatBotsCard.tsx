import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Plus } from "lucide-react";

// Demo data
const demoChatBots = [
  {
    id: 1,
    name: "Customer Support Bot",
    description: "Handles customer inquiries",
  },
  {
    id: 2,
    name: "Booking Assistant",
    description: "Manages appointment bookings",
  },
  {
    id: 3,
    name: "FAQ Bot",
    description: "Answers frequently asked questions",
  },
  {
    id: 4,
    name: "Feedback Collector",
    description: "Collects customer feedback",
  },
  {
    id: 5,
    name: "Promotion Notifier",
    description: "Notifies users about promotions",
  },
  {
    id: 6,
    name: "Reminder Bot",
    description: "Sends appointment reminders",
  },
  {
    id: 7,
    name: "Survey Bot",
    description: "Conducts customer surveys",
  },
];

const ChatBotsCard: React.FC = () => {
  const handleAddChatBot = () => {
    // TODO: Implement add chatbot functionality
    console.log("Add ChatBot clicked");
  };

  return (
    <Card className="h-full shadow-md dark:shadow-gray-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">My ChatBots</CardTitle>
        <Button onClick={handleAddChatBot} size="sm" className="gap-1 text-white">
          <Plus className="h-4 w-4" />
          Add chatbot
        </Button>
      </CardHeader>
      <CardContent>
        {demoChatBots.length === 0 ? (
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
            {demoChatBots.map((chatbot) => (
              <div
                key={chatbot.id}
                className="bg-card hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-4 shadow-md transition-colors dark:shadow-gray-600"
              >
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Bot className="text-primary h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm leading-none font-medium">
                    {chatbot.name}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {chatbot.description}
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
