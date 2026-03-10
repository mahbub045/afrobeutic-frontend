export interface ChatBot {
  chatbot_name: string;
  whatsapp_number: string;
  status: string;
  salon: string;
  message_limit: number;
  remaining_messages: number;
}

export type ChatBotsListResponse = {
  count?: number;
  results?: ChatBot[];
};
