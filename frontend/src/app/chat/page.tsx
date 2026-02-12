"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, logout, isAuthenticated } from "@/lib/auth";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [conversationId, setConversationId] = useState<number | undefined>();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const session = getSession();
    if (session) {
      setUserEmail(session.user.email);
    }
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleNewChat = () => {
    setConversationId(undefined);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Chat Assistant</span>
          </h1>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNewChat}
            className="px-4 py-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all text-sm"
          >
            New Chat
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-all text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/tasks"
          className="px-5 py-2.5 bg-gray-800/50 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-gray-200 transition-all text-sm border border-gray-800"
        >
          Dashboard
        </Link>
        <span className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20">
          Chat Assistant
        </span>
      </div>

      {/* Chat Interface */}
      <ChatInterface
        conversationId={conversationId}
        onConversationCreated={(id) => setConversationId(id)}
      />

      {/* Help text */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          Try: &quot;Add a task to buy groceries&quot; or &quot;Show my
          tasks&quot;
        </p>
      </div>
    </div>
  );
}
