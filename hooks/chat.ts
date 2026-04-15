"use client";

import { useEffect, useState, useCallback } from "react";

export type ChatMessage = {
  sender: string;
  text: string;
  timestamp: number;
};

export default function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/chat");
        if (response.status === 401) {
          setError("Please sign in to view chat history");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to load chat history");
        }
        const data = await response.json();
        setMessages(data.history);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    loadHistory();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError("Message cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (response.status === 401) {
        setError("Your session expired. Please sign in again.");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear history");
      }

      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    clearHistory,
    isLoading,
    error,
    clearError,
  };
}

