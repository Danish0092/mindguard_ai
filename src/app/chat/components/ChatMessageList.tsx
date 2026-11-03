"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { formatMessageTime } from "../utils/date-grouping";

export function ChatMessageList({
  messages,
  loading,
  isTyping,
  error,
}: {
  messages: ChatMessage[];
  loading: boolean;
  isTyping: boolean;
  error?: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 lg:px-16 space-y-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D96535] border-t-transparent mb-3" />
          <p className="text-xs text-[#927D71]">Loading conversation...</p>
        </div>
      ) : (
        <>
          {/* Default Friendly Initial Greeting when no messages exist */}
          {messages.length === 0 && (
            <div className="flex justify-start pt-6 animate-in fade-in duration-200">
              <div className="max-w-[85%] sm:max-w-[70%] rounded-[22px] bg-[#EDE3DC] px-5 py-3.5 text-sm leading-relaxed text-[#3D2E27] shadow-xs">
                Hey, I&apos;m here. What&apos;s on your mind today?
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((item) => {
            const isUser = item.role === "student";
            const timeLabel = formatMessageTime(item.createdAt);

            return (
              <div
                key={item.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[72%] whitespace-pre-wrap rounded-[22px] px-5 py-3.5 text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-[#CE643B] text-white"
                      : "bg-[#EDE3DC] text-[#3D2E27]"
                  }`}
                >
                  {item.content}
                </div>

                {timeLabel && (
                  <span className="mt-1 px-2 text-[10px] text-[#A8968B] select-none">
                    {timeLabel}
                  </span>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-150">
              <div className="rounded-[22px] bg-[#EDE3DC] px-5 py-3.5 shadow-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#8A6D5E] animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-[#8A6D5E] animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-[#8A6D5E] animate-bounce" />
              </div>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="flex justify-center pt-2">
              <div className="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-2 text-xs text-red-700">
                {error}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
}
