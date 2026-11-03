export type MessageRole = "student" | "assistant" | "counselor";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  seq: number;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
  title: string;
  preview: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export type GroupedConversations = {
  today: ConversationSummary[];
  yesterday: ConversationSummary[];
  previous7Days: ConversationSummary[];
  older: ConversationSummary[];
};
