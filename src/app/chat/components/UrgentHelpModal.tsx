"use client";

export function UrgentHelpModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="urgent-help-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#35251F]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#F6D9BE] bg-[#FFFAF6] p-6 sm:p-7 shadow-[0_25px_60px_rgba(138,61,30,0.18)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDE7DB] text-[#D96535]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3
                id="urgent-help-title"
                className="text-lg font-bold text-[#49372F]"
              >
                Immediate Support
              </h3>
              <p className="text-xs text-[#927D71]">You don&apos;t have to go through this alone</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#927D71] hover:bg-[#F3DFD1]/50 hover:text-[#49372F] transition"
            aria-label="Close dialog"
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
        </div>

        <p className="text-sm text-[#49372F] leading-relaxed">
          MindGuard AI is an automated companion and cannot provide emergency intervention.
          If you are experiencing severe distress, crisis, or thinking about hurting yourself,
          please connect with one of these verified student support resources immediately:
        </p>

        <div className="mt-4 space-y-2.5">
          <div className="rounded-2xl border border-[#F5D8C3] bg-white p-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C66A43]">
              Campus Counseling Center
            </p>
            <p className="mt-1 text-sm font-semibold text-[#49372F]">
              Student Wellbeing & Support Clinic
            </p>
            <p className="text-xs text-[#927D71] mt-0.5">
              Mon–Fri 9:00 AM – 5:00 PM • Campus Medical & Wellness Block
            </p>
          </div>

          <div className="rounded-2xl border border-[#F5D8C3] bg-white p-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C66A43]">
              24/7 Mental Health Helpline
            </p>
            <p className="mt-1 text-sm font-semibold text-[#49372F]">
              Umang Mental Health Support: 0311-7786264
            </p>
            <p className="text-xs text-[#927D71] mt-0.5">
              Free, confidential emotional support available 24 hours every day.
            </p>
          </div>

          <div className="rounded-2xl border border-[#F5D8C3] bg-white p-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C66A43]">
              Emergency Rescue Services
            </p>
            <p className="mt-1 text-sm font-semibold text-[#49372F]">
              National Emergency: 1122
            </p>
            <p className="text-xs text-[#927D71] mt-0.5">
              For immediate medical, physical safety, or life-threatening emergencies.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-[#D96535] py-2.5 text-sm font-semibold text-white transition hover:bg-[#BE5128] focus:outline-none focus:ring-2 focus:ring-[#D96535]"
          >
            I understand, return to chat
          </button>
        </div>
      </div>
    </div>
  );
}
