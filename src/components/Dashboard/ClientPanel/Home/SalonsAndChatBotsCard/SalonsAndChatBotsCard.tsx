import ChatBotsCard from "./ChatBotsCard/ChatBotsCard";
import SalonsCard from "./SalonsCard/SalonsCard";

const SalonsAndChatBotsCard: React.FC = () => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SalonsCard />
      <ChatBotsCard />
    </div>
  );
};

export default SalonsAndChatBotsCard;
