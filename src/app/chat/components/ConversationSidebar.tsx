"use client";

import { useMemo, useState } from "react";
import type { ConversationSummary } from "../types";
import { groupConversationsByDate } from "../utils/date-grouping";

export function ConversationSidebar({
  conversations,
  activeConversationId,
  loading,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  onNewConversation,
  onRequestDelete,
  onCloseMobile,
}: {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRequestDelete: (conv: ConversationSummary) => void;
  onCloseMobile?: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  // Group conversations by date
  const groups = useMemo(() => {
    return groupConversationsByDate(conversations);
  }, [conversations]);

  const totalCount = conversations.length;

  const renderGroup = (
    title: string,
    items: ConversationSummary[]
  ) => {
    if (items.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        <h4 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#A8968B]">
          {title}
        </h4>
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = item.id === activeConversationId;
            const letter = item.title
              ? item.title.trim().charAt(0).toUpperCase()
              : "C";

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelectConversation(item.id);
                  onCloseMobile?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectConversation(item.id);
                    onCloseMobile?.();
                  }
                }}
                className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition cursor-pointer select-none text-left ${
                  isActive
                    ? "bg-[#FCEEE4] border border-[#F4D7C2]"
                    : "border border-transparent hover:bg-[#FAF2EC]"
                }`}
              >
                {/* Initial Badge */}
                <div className="h-8 w-8 rounded-full bg-[#D96535] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  {letter}
                </div>

                {/* Title & Preview */}
                <div className="flex-1 min-w-0 pr-6">
                  <p
                    className={`text-xs font-semibold truncate ${
                      isActive ? "text-[#3B2A22]" : "text-[#49372F]"
                    }`}
                  >
                    {item.title || "New conversation"}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  title="Delete conversation"
                  aria-label={`Delete ${item.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete(item);
                  }}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-[#9B6247] hover:text-red-600 hover:bg-red-50/70 transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path
                      d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-full md:w-80 bg-[#FFFDFB] border-r border-[#EFE4DA] flex flex-col h-full shrink-0 select-none">
      {/* Top Header: Title & Total Count */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#3B2A22]">
            Conversations
          </h2>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#FCE8DB] px-3 py-0.5 text-xs font-semibold text-[#8A3D1E]">
              {totalCount} total
            </span>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-[#8A6D5E] hover:bg-[#FBE5D8]"
                aria-label="Close conversation history"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* + New Conversation Button */}
        <button
          type="button"
          onClick={() => {
            onNewConversation();
            onCloseMobile?.();
          }}
          className="w-full rounded-full bg-gradient-to-r from-[#DF622B] to-[#C95522] py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition transform active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-4 w-4"
          >
            <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
          </svg>
          <span>New conversation</span>
        </button>

        {/* Search input */}
        <div className="mt-3 relative">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#A8968B]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search conversations"
            className={`w-full rounded-full bg-[#FAF1EA] py-2 pl-9 pr-8 text-xs text-[#49372F] placeholder:text-[#A8968B] outline-none transition ${
              isFocused
                ? "bg-white ring-2 ring-[#FBE5D8] border border-[#F6D9BE]"
                : "border border-transparent hover:bg-[#F5ECE3]"
            }`}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-2.5 flex items-center text-[#A8968B] hover:text-[#49372F]"
              aria-label="Clear search"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3.5 w-3.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Conversations List with Scroll */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {loading && conversations.length === 0 ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded-2xl bg-[#F5ECE3]"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FBE5D8] text-[#D96535]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-[#49372F]">
              {searchQuery ? "No matching conversations" : "No conversations yet"}
            </p>
            <p className="mt-1 text-[11px] text-[#927D71]">
              {searchQuery
                ? "Try searching with a different term."
                : "Click '+ New conversation' to begin."}
            </p>
          </div>
        ) : (
          <>
            {renderGroup("TODAY", groups.today)}
            {renderGroup("YESTERDAY", groups.yesterday)}
            {renderGroup("PREVIOUS 7 DAYS", groups.previous7Days)}
            {renderGroup("OLDER", groups.older)}
          </>
        )}
      </div>
    </aside>
  );
}
