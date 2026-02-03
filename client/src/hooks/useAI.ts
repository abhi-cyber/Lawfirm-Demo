import {useState} from "react";
import axios from "axios";

// Use the same base URL as the main API service
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

interface Message {
  role: "user" | "assistant" | "tool";
  content: string;
}

export const useAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const userMsg: Message = {role: "user", content};
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
        messages: newMessages,
      });

      // The backend returns the assistant's response (which might refer to tool calls handled on backend)
      // Since our backend handles tool calls recursively and returns the final answer, we just display it.
      // Or if the backend returns the whole history, we update it.
      // Based on aiController, it returns 'finalResponse.message' or 'responseMessage'.

      const assistantMessage = response.data;
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error connecting to the AI brain.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {messages, sendMessage, isLoading, clearMessages};
};
