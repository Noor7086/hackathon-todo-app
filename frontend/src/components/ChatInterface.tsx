"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { api, Message } from "@/lib/api";

interface ChatInterfaceProps {
  conversationId?: number;
  onConversationCreated?: (id: number) => void;
}

interface ChatMessage {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

export default function ChatInterface({
  conversationId,
  onConversationCreated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | undefined
  >(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            'Hello! I\'m your task assistant. You can ask me to:\n\n• Add tasks (e.g., "Add a task to buy groceries")\n• Show your tasks (e.g., "What do I need to do?")\n• Complete tasks (e.g., "Mark task 1 as complete")\n• Delete tasks (e.g., "Delete task 2")\n\nHow can I help you today?',
        },
      ]);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (convId: number) => {
    try {
      const msgs = await api.getMessages(convId);
      setMessages(
        msgs.map((m: Message) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      );
      setCurrentConversationId(convId);
    } catch {
      setError("Failed to load messages");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content: userMessage },
      { id: "pending", role: "assistant", content: "", pending: true },
    ]);

    setLoading(true);

    try {
      const response = await api.sendMessage(
        userMessage,
        currentConversationId,
      );

      if (!currentConversationId) {
        setCurrentConversationId(response.conversation_id);
        onConversationCreated?.(response.conversation_id);
      }

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== "pending")
          .concat({
            id: response.message_id,
            role: "assistant",
            content: response.response,
          }),
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== "pending"));
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass-card overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-gray-800 text-gray-200 border border-gray-700"
              } ${message.pending ? "animate-pulse" : ""}`}
            >
              {message.pending ? (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-900/30 border-t border-red-800">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-800 p-4 flex gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
