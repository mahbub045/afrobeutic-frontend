export interface ChatBot {
  chatbot_name: string;
  whatsapp_number: string;
  status: string;
  salon: string;
}

export type ChatBotsListResponse = {
  count?: number;
  results?: ChatBot[];
};
