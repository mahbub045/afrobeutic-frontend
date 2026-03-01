export interface ChatBot {
  chatbot_name: string;
  whatsapp_sender_number: string;
  status: string;
  salon: string;
}

export type ChatBotsListResponse = {
  count?: number;
  results?: ChatBot[];
};
