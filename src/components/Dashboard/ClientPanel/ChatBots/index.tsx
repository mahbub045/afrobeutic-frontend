import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import ChatBotList from "./ChatBotList/ChatBotList";

const ChatBotsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "ChatBots",
            href: "/dashboard/client-panel/chatbots",
          },
        ]}
      />
      <ChatBotList />
    </div>
  );
};

export default ChatBotsContainer;
