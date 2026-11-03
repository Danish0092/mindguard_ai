"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AuthShell,
  AuthField,
  AuthSubmit,
} from "@/components/auth/AuthShell";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        setError("Signed in, but we couldn't load your account. Please try again.");
        return;
      }

      const user = await response.json();

      router.push(
        user.role === "counselor" ? "/counselor" : "/dashboard"
      );
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell message="A little progress, every day.">
      <div className="mb-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBE5D8] text-[#B84F28]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path
              d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M8 12h2l1.2-2.5L13 15l1.2-3H16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#C66A43]">
          MindGuard AI
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-[#49372F]">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#927D71]">
          Sign in to continue your wellbeing journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@university.edu"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold text-[#49372F]"
            >
              Password
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[#E8DCD4] bg-[#FFFCFA] px-4 py-3 pr-20 text-[15px] text-[#49372F] outline-none transition placeholder:text-[#B6A49A] focus:border-[#D96A3B] focus:ring-2 focus:ring-[#FBE5D8]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3 text-xs font-semibold text-[#B85B35] hover:text-[#8A3D1E]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <AuthSubmit type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in to your account"}
        </AuthSubmit>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#EFE4DC]" />
        <span className="text-xs text-[#A18D81]">YOUR SPACE, YOUR PACE</span>
        <div className="h-px flex-1 bg-[#EFE4DC]" />
      </div>

      <p className="text-center text-sm text-[#927D71]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#C45B31] transition hover:text-[#8A3D1E]"
        >
          Create one
        </Link>
      </p>

      <p className="mt-6 text-center text-xs leading-5 text-[#A18D81]">
        Your wellbeing matters. Take things one step at a time.
      </p>
    </AuthShell>
  );
}
