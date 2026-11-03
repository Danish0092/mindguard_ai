"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, ConversationSummary, CurrentUser } from "./types";
import { ChatNavigationRail } from "./components/ChatNavigationRail";
import { ConversationSidebar } from "./components/ConversationSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessageList } from "./components/ChatMessageList";
import { ChatComposer } from "./components/ChatComposer";
import { UrgentHelpModal } from "./components/UrgentHelpModal";
import { DeleteConversationModal } from "./components/DeleteConversationModal";

export default function ChatInterface({
  currentUser = { id: "", name: "Student", email: "" },
}: {
  currentUser?: CurrentUser;
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUrgentHelpOpen, setIsUrgentHelpOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] =
    useState<ConversationSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load conversations list
  const loadConversations = useCallback(
    async (search = "", keepActiveId?: string | null) => {
      setLoadingConversations(true);
      try {
        const url = search
          ? `/api/chat/conversations?search=${encodeURIComponent(search)}`
          : `/api/chat/conversations`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Unable to load conversations.");

        const data = await res.json();
        const list: ConversationSummary[] = data.conversations || [];
        setConversations(list);

        // Select conversation if none selected
        if (!search) {
          if (keepActiveId && list.some((c) => c.id === keepActiveId)) {
            setActiveConversationId(keepActiveId);
          } else if (list.length > 0) {
            setActiveConversationId((prev) => (prev ? prev : list[0].id));
          } else {
            setActiveConversationId(null);
            setMessages([]);
          }
        }
      } catch (err) {
        console.error("Load conversations error:", err);
      } finally {
        setLoadingConversations(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadConversations(searchQuery, activeConversationId);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, loadConversations, activeConversationId]);

  // Load messages whenever activeConversationId changes
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    setError("");

    try {
      const res = await fetch(
        `/api/chat/messages?conversationId=${encodeURIComponent(convId)}`
      );

      if (!res.ok) {
        throw new Error("Unable to load messages.");
      }

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat history.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      void loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  // Create new conversation
  async function handleNewConversation() {
    setError("");
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Could not start a new conversation.");

      const data = await res.json();
      const newConv: ConversationSummary = data.conversation;

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start new conversation."
      );
    }
  }

  // Send message
  async function handleSendMessage(content: string) {
    if (!content.trim() || isSending) return;

    setError("");
    let convId = activeConversationId;

    // If no active conversation exists, create one first
    if (!convId) {
      try {
        const createRes = await fetch("/api/chat/conversations", {
          method: "POST",
        });
        if (!createRes.ok) throw new Error("Could not create conversation.");
        const createData = await createRes.json();
        convId = createData.conversation.id;
        setActiveConversationId(convId);
        setConversations((prev) => [createData.conversation, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create conversation.");
        return;
      }
    }

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      role: "student",
      content,
      seq: messages.length + 1,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setIsSending(true);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to send message.");
      }

      // Replace optimistic message with actual student message & assistant message
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== optimisticId);
        const next = [...filtered, data.message];
        if (data.assistantMessage) {
          next.push(data.assistantMessage);
        }
        return next;
      });

      // Update conversations sidebar item title & count
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            const hasCustomTitle = c.title && c.title !== "New conversation";
            return {
              ...c,
              title: hasCustomTitle
                ? c.title
                : content.length > 40
                ? `${content.slice(0, 40)}...`
                : content,
              messageCount: c.messageCount + (data.assistantMessage ? 2 : 1),
            };
          }
          return c;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
      // Rollback optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      throw err;
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }

  // Delete conversation
  async function handleConfirmDelete() {
    if (!conversationToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/chat/conversations?id=${encodeURIComponent(conversationToDelete.id)}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Unable to delete conversation.");
      }

      const deletedId = conversationToDelete.id;

      // Update conversations list state immediately
      setConversations((prev) => {
        const nextList = prev.filter((c) => c.id !== deletedId);

        // If currently open conversation was deleted, switch or reset
        if (activeConversationId === deletedId) {
          if (nextList.length > 0) {
            setActiveConversationId(nextList[0].id);
          } else {
            setActiveConversationId(null);
            setMessages([]);
          }
        }

        return nextList;
      });

      setConversationToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete conversation."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FFFBF7]">
      {/* 1. Left Navigation Rail (Desktop) */}
      <ChatNavigationRail currentUser={currentUser} />

      {/* 2. Conversation History Sidebar */}
      {/* Desktop view */}
      <div className="hidden md:flex h-full">
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          loading={loadingConversations}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onRequestDelete={(conv) => setConversationToDelete(conv)}
        />
      </div>

      {/* Mobile Drawer view */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 flex h-full w-4/5 max-w-sm flex-col bg-white shadow-xl">
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              loading={loadingConversations}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectConversation={setActiveConversationId}
              onNewConversation={handleNewConversation}
              onRequestDelete={(conv) => setConversationToDelete(conv)}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Chat Panel */}
      <main className="flex flex-1 flex-col h-full bg-[#FFFBF7] min-w-0 overflow-hidden">
        <ChatHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenUrgentHelp={() => setIsUrgentHelpOpen(true)}
        />

        <ChatMessageList
          messages={messages}
          loading={loadingMessages}
          isTyping={isTyping}
          error={error}
        />

        <ChatComposer
          onSendMessage={handleSendMessage}
          isSending={isSending}
          disabled={loadingMessages}
        />
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConversationModal
        isOpen={Boolean(conversationToDelete)}
        conversationTitle={conversationToDelete?.title || "this conversation"}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConversationToDelete(null)}
      />

      {/* Urgent Help Modal */}
      <UrgentHelpModal
        isOpen={isUrgentHelpOpen}
        onClose={() => setIsUrgentHelpOpen(false)}
      />
    </div>
  );
}
