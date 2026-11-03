
import { requireRole } from "@/app/lib/auth-guard";

export default async function CounselorPage() {
  const user = await requireRole("counselor");

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            MindGuard AI
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Counselor Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Welcome, {user.name ?? "Counselor"}.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Student Cases
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              View and manage student cases.
            </p>
            <p className="mt-4 text-sm text-slate-400">
              Coming soon
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Assessments
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Review student risk assessments.
            </p>
            <p className="mt-4 text-sm text-slate-400">
              Coming soon
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Follow-ups
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Track cases that need follow-up.
            </p>
            <p className="mt-4 text-sm text-slate-400">
              Coming soon
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
