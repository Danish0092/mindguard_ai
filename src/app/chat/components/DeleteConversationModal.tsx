"use client";

export function DeleteConversationModal({
  isOpen,
  conversationTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  conversationTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#35251F]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm rounded-3xl border border-[#F6D9BE] bg-[#FFFAF6] p-6 shadow-[0_20px_50px_rgba(138,61,30,0.18)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBE5D8] text-[#B84F28] mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        <h3
          id="delete-dialog-title"
          className="text-lg font-bold text-[#49372F]"
        >
          Delete conversation?
        </h3>

        <p className="mt-2 text-sm text-[#927D71] leading-relaxed">
          Are you sure you want to delete &ldquo;
          <span className="font-semibold text-[#49372F]">{conversationTitle}</span>
          &rdquo;? All messages in this conversation will be permanently removed.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-full border border-[#E8DCD4] bg-white px-4 py-2 text-sm font-semibold text-[#49372F] hover:bg-[#FAF4EF] transition focus:outline-none focus:ring-2 focus:ring-[#FBE5D8] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-full bg-[#D96535] px-5 py-2 text-sm font-semibold text-white hover:bg-[#BE5128] transition focus:outline-none focus:ring-2 focus:ring-[#D96535] disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
