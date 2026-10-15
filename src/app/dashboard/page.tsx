
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              MindGuard AI
            </h1>
            <p className="mt-2 text-slate-600">
              Your personal student wellbeing space
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-indigo-600">
            Student dashboard
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Welcome, {session.user.name || "Student"}!
          </h2>

          <p className="mt-3 text-slate-600">
            You are signed in to MindGuard AI.
          </p>

          <div className="mt-6 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {session.user.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>{" "}
              {session.user.role}
            </p>
          </div>
        </section>

        <p className="mt-6 text-sm text-slate-500">
          This is the initial dashboard. Wellbeing check-ins and AI
          companion features will be added in later steps.
        </p>
      </div>
    </main>
  );
}
