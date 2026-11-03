
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AuthShell,
  AuthField,
  AuthSubmit,
} from "@/components/auth/AuthShell";
import {
  verifyEmailCode,
  resendVerificationCode,
  type VerificationResult,
} from "./actions";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();

  const [verifyState, verifyAction, verifying] = useActionState<
    VerificationResult,
    FormData
  >(verifyEmailCode, undefined);

  const [resendState, resendAction, resending] = useActionState<
    VerificationResult,
    FormData
  >(resendVerificationCode, undefined);

  return (
    <AuthShell message="One more step toward your safe space.">
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#C66A43]">
          MindGuard AI
        </p>
        <h1 className="text-2xl font-bold text-[#49372F]">
          Verify your university email
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#927D71]">
          We sent a six-digit code to{" "}
          <span className="font-semibold">{email || "your email address"}</span>.
          The code expires in 10 minutes.
        </p>
      </div>

      {!email ? (
        <div className="flex flex-col gap-4">
          <p role="alert" className="text-sm text-red-600">
            The email address is missing. Please start registration again.
          </p>
          <Link
            href="/register"
            className="text-sm font-semibold text-[#C45B31]"
          >
            Return to registration
          </Link>
        </div>
      ) : (
        <>
          <form action={verifyAction} className="flex flex-col gap-4">
            <input type="hidden" name="email" value={email} />

            <AuthField
              id="code"
              name="code"
              label="Verification code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={6}
              maxLength={6}
              placeholder="Enter your 6-digit code"
            />

            {verifyState?.error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {verifyState.error}
              </p>
            )}

            <AuthSubmit type="submit" disabled={verifying}>
              {verifying ? "Verifying..." : "Verify email"}
            </AuthSubmit>
          </form>

          <div className="my-5 border-t border-[#E8DCD4]" />

          <form action={resendAction} className="flex flex-col gap-3">
            <input type="hidden" name="email" value={email} />

            {resendState?.error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {resendState.error}
              </p>
            )}

            <button
              type="submit"
              disabled={resending}
              className="rounded-xl border border-[#E8DCD4] px-4 py-3 text-sm font-semibold text-[#8A3D1E] hover:bg-[#FFF3EA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? "Sending code..." : "Resend verification code"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#927D71]">
            Wrong email?{" "}
            <Link href="/register" className="font-semibold text-[#C45B31]">
              Register again
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
