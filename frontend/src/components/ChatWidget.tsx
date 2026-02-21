"use client";

import { useState } from "react";
import ChatInterface from "./ChatInterface";
import { isAuthenticated } from "@/lib/auth";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>();

  const handleToggle = () => {
    if (!open && !isAuthenticated()) return; // silently ignore if not logged in
    setOpen((prev) => !prev);
  };

  return (
    <>
      {/* Slide-up chat panel */}
      {open && (
        <div className="chat-widget-panel">
          {/* Panel header */}
          <div className="chat-widget-header">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-gray-100">
                Chat Assistant
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setConversationId(undefined);
                }}
                title="New chat"
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-all"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-all"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat body — override ChatInterface's fixed h-[600px] */}
          <div className="flex-1 min-h-0 overflow-hidden [&>div]:h-full [&>div]:rounded-none [&>div]:border-0">
            <ChatInterface
              conversationId={conversationId}
              onConversationCreated={(id) => setConversationId(id)}
            />
          </div>
        </div>
      )}

      {/* Floating action button */}
      <button
        onClick={handleToggle}
        aria-label={open ? "Close chat" : "Open Chat Assistant"}
        className={`chat-fab ${open ? "chat-fab-active" : ""}`}
      >
        {open ? (
          /* X icon when open */
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          /* Chat bubble icon when closed */
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
