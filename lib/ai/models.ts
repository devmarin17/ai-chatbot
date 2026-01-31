// Student Information Chatbot - Single Groq Model
export const DEFAULT_CHAT_MODEL = "llama-3.3-70b-versatile";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "groq",
    description: "Fast and capable model for student information queries",
  },
];

export const modelsByProvider = {
  groq: chatModels,
};
