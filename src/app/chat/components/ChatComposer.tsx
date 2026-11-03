"use client";

import { useRef, useState, type KeyboardEvent, type FormEvent } from "react";

export function ChatComposer({
  onSendMessage,
  isSending,
  disabled,
}: {
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  disabled: boolean;
}) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = Boolean(content.trim()) && !isSending && !disabled;

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSendMessage(trimmed);
    } catch {
      // Restore typed message so student can retry easily
      setContent(trimmed);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  // Adjust textarea height up to 120px
  function handleChange(val: string) {
    setContent(val);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }

  return (
    <footer className="p-4 sm:p-6 bg-transparent shrink-0">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl rounded-full bg-white border border-[#EBE1D7] shadow-[0_4px_20px_rgba(138,61,30,0.06)] pl-6 pr-2 py-1.5 flex items-center gap-3 transition focus-within:border-[#D96535] focus-within:ring-2 focus-within:ring-[#FBE5D8]"
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type how you're feeling..."
          rows={1}
          maxLength={4000}
          disabled={disabled || isSending}
          className="flex-1 resize-none bg-transparent py-2 text-sm text-[#49372F] placeholder:text-[#A8968B] outline-none max-h-32 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          title={isSending ? "Sending..." : "Send message"}
          aria-label="Send message"
          className={`h-10 w-10 rounded-full flex items-center justify-center text-white transition transform shrink-0 shadow-xs ${
            canSubmit
              ? "bg-[#CE643B] hover:bg-[#B8532B] active:scale-95 cursor-pointer"
              : "bg-[#EAA785] opacity-80 cursor-not-allowed"
          }`}
        >
          {isSending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-4 w-4"
            >
              <line x1="12" y1="19" x2="12" y2="5" strokeLinecap="round" />
              <polyline points="5 12 12 5 19 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </form>
    </footer>
  );
}
