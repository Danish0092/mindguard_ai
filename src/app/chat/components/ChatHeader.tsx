"use client";

export function ChatHeader({
  onOpenMobileSidebar,
  onOpenUrgentHelp,
}: {
  onOpenMobileSidebar: () => void;
  onOpenUrgentHelp: () => void;
}) {
  return (
    <header className="h-18 px-5 sm:px-8 border-b border-[#F0DDD0] bg-[#FFFBF7] flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3.5">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-[#8A6D5E] hover:bg-[#FBE5D8] transition"
          aria-label="Open conversations menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        {/* Brand Avatar */}
        <div className="h-10 w-10 rounded-full bg-[#CE643B] flex items-center justify-center text-white shadow-xs shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path
              d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Brand Title & Status */}
        <div className="flex flex-col">
          <h1 className="text-[15px] font-bold text-[#3B2A22] leading-tight">
            MindGuard AI
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-[11px] font-medium text-[#2E7D32]">
              Always here, always listening
            </span>
          </div>
        </div>
      </div>

      {/* Right Urgent Help Action */}
      <button
        type="button"
        onClick={onOpenUrgentHelp}
        className="rounded-full border border-[#CE643B] px-4 py-1.5 text-xs font-semibold text-[#CE643B] hover:bg-[#FBE5D8]/60 transition transform active:scale-95 shadow-xs"
      >
        Need urgent help?
      </button>
    </header>
  );
}
