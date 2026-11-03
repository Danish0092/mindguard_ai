import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function AuthShell({
  message,
  children,
}: {
  message: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#FFFAF6] md:flex-row">
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full opacity-30 blur-[75px]"
        style={{ background: "#E1642F" }}
      />
      <div
        className="pointer-events-none absolute left-28 top-14 h-[420px] w-[420px] rounded-full opacity-20 blur-[70px]"
        style={{ background: "#DD9F4E" }}
      />

      <section className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:px-8 md:basis-1/2 md:px-12">
        <div className="w-full max-w-[440px] rounded-3xl border border-[#F6D9BE] bg-white p-6 shadow-[0_30px_80px_rgba(138,61,30,0.12)] sm:p-8">
          {children}
        </div>
      </section>

      <aside className="relative flex min-h-[260px] flex-1 items-center overflow-hidden p-8 sm:min-h-[320px] sm:p-12 md:min-h-screen md:basis-1/2">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg,#F8E4D4,#FBEADD 45%,#F8E4D4)",
          }}
        />

        <div className="relative z-10 max-w-md py-6">
          <span className="mb-5 inline-flex rounded-full border border-[#EAC4A9] bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A3D1E]">
            Your wellbeing matters
          </span>

          <p className="font-display text-3xl font-bold leading-tight text-[#8A3D1E] sm:text-4xl md:text-5xl">
            {message}
          </p>

          <p className="mt-5 max-w-sm text-sm leading-7 text-[#9B6247] sm:text-base">
            Take a moment for yourself. Every feeling deserves space, and every
            step forward counts.
          </p>
        </div>

        <div
          className="pointer-events-none absolute -bottom-16 -right-16 h-[280px] w-[280px] rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%,#F7D3B4,#EE9660)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-28 right-24 h-32 w-32 rounded-full opacity-80"
          style={{
            background: "radial-gradient(circle at 40% 35%,#FFF1E5,#E2D3AB)",
          }}
        />
        <div
          className="pointer-events-none absolute right-10 top-10 h-20 w-20 rounded-full opacity-70"
          style={{
            background: "radial-gradient(circle at 40% 35%,#F8E4D4,#F2A671)",
          }}
        />
      </aside>
    </main>
  );
}

export function AuthField({
  label,
  compact = false,
  error,
  className = "",
  ...props
}: {
  label: string;
  compact?: boolean;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[#49372F]">{label}</span>
      <input
        {...props}
        className={`w-full rounded-xl border ${
          error ? "border-red-400 bg-red-50/20" : "border-[#E8DCD4] bg-[#FFFCFA]"
        } ${
          compact ? "px-3 py-2 text-sm" : "px-4 py-2.5 text-[15px]"
        } text-[#49372F] outline-none transition placeholder:text-[#B6A49A] focus:border-[#D96A3B] focus:ring-2 focus:ring-[#FBE5D8] ${className}`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function AuthSubmit({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-full bg-[#D96535] py-3 text-[15px] font-semibold text-white transition hover:bg-[#BE5128] focus:outline-none focus:ring-2 focus:ring-[#D96535] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
