import { createGroq } from "@ai-sdk/groq";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
        },
      });
    })()
  : null;

export function getLanguageModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("chat-model");
  }

  return groq("llama-3.3-70b-versatile");
}
