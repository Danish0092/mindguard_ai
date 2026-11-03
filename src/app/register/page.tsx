"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AuthShell, AuthField, AuthSubmit } from "@/components/auth/AuthShell";
import { signup, type SignupResult } from "./actions";
import { parseStudentUniversityEmail } from "@/app/lib/university-email";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupResult, FormData>(
    signup,
    undefined,
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [stepError, setStepError] = useState("");

  // Step 1: Personal Details
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState("Lahore");
  const [batch, setBatch] = useState("");
  const [program, setProgram] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [detailsDetected, setDetailsDetected] = useState(false);

  // Step 2: Account Security
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  function handleEmailChange(value: string) {
    setEmail(value);
    setStepError("");

    // Automatically synchronize detected values if the user types a valid university email
    const details = parseStudentUniversityEmail(value);
    if (details) {
      setCampus(details.campus);
      setBatch(details.batch);
      setProgram(details.program);
      setRollNumber(details.rollNumber);
    }
  }

  function handleDetectDetails() {
    setStepError("");
    const trimmed = email.trim();

    if (!trimmed) {
      setStepError("Please enter your university email first.");
      return;
    }

    const details = parseStudentUniversityEmail(trimmed);
    if (!details) {
      setStepError(
        "Please enter a valid COMSATS Lahore student email (e.g. FA23-BSE-044@cuilahore.edu.pk).",
      );
      setDetailsDetected(false);
      return;
    }

    setCampus(details.campus);
    setBatch(details.batch);
    setProgram(details.program);
    setRollNumber(details.rollNumber);
    setDetailsDetected(true);
  }

  function handleContinue() {
    setStepError("");

    if (displayName.trim().length < 2) {
      setStepError("Please enter your full name (at least 2 characters).");
      return;
    }

    const trimmed = email.trim();
    const details = parseStudentUniversityEmail(trimmed);
    if (!details) {
      setStepError(
        "Please enter a valid COMSATS Lahore student email (e.g. FA23-BSE-044@cuilahore.edu.pk).",
      );
      return;
    }

    // Auto-populate academic fields if not already detected
    if (!detailsDetected) {
      setCampus(details.campus);
      setBatch(details.batch);
      setProgram(details.program);
      setRollNumber(details.rollNumber);
      setDetailsDetected(true);
    }

    if (
      !campus.trim() ||
      !batch.trim() ||
      !program.trim() ||
      !rollNumber.trim()
    ) {
      setStepError("Please verify your university details before continuing.");
      return;
    }

    setStep(2);
  }

  function handleBack() {
    setStepError("");
    setStep(1);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setStepError("");

    // Validate Step 1 fields
    if (displayName.trim().length < 2) {
      event.preventDefault();
      setStep(1);
      setStepError("Please enter your full name (at least 2 characters).");
      return;
    }

    const details = parseStudentUniversityEmail(email.trim());
    if (!details) {
      event.preventDefault();
      setStep(1);
      setStepError(
        "Please enter a valid COMSATS Lahore student email (e.g. FA23-BSE-044@cuilahore.edu.pk).",
      );
      return;
    }

    // Validate Step 2 fields
    if (password.length < 8) {
      event.preventDefault();
      setStepError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      setStepError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      event.preventDefault();
      setStepError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
  }

  const errorMessage = stepError || state?.error;

  return (
    <AuthShell message="You're not alone in this.">
      {/* Header and Step Progress Indicator */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C66A43]">
            MindGuard AI
          </p>
          <span className="rounded-full bg-[#FFF0E6] px-3 py-0.5 text-xs font-semibold text-[#8A3D1E]">
            Step {step} of 2
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#49372F]">
          {step === 1 ? "Personal details" : "Account security"}
        </h1>
        <p className="mt-1 text-xs leading-5 text-[#927D71]">
          {step === 1
            ? "Enter your name and COMSATS email to detect student credentials."
            : "Choose a secure password to protect your mental wellness account."}
        </p>

        {/* 2-Segment Progress Bar */}
        <div className="mt-3.5 flex items-center gap-2" aria-hidden="true">
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              step >= 1 ? "bg-[#D96535]" : "bg-[#F0D7C5]"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              step === 2 ? "bg-[#D96535]" : "bg-[#F0D7C5]"
            }`}
          />
        </div>
      </div>

      <form
        noValidate
        action={formAction}
        onSubmit={handleSubmit}
        className="flex flex-col gap-3.5"
      >
        <input type="hidden" name="role" value="student" />
        <input
          type="hidden"
          name="university"
          value="COMSATS University Islamabad, Lahore Campus"
        />

        {/* STEP 1: PERSONAL DETAILS */}
        <div
          className={`space-y-3.5 transition-opacity duration-200 ${
            step === 1 ? "block" : "hidden"
          }`}
        >
          <AuthField
            id="displayName"
            name="displayName"
            label="Full name"
            autoComplete="name"
            maxLength={100}
            placeholder="Enter your full name"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setStepError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleContinue();
              }
            }}
          />

          <div className="space-y-2">
            <AuthField
              id="email"
              name="email"
              label="University email"
              type="email"
              autoComplete="email"
              maxLength={254}
              placeholder="FA23-BSE-044@cuilahore.edu.pk"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleContinue();
                }
              }}
            />

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleDetectDetails}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8DCD4] bg-[#FFF8F3] px-3.5 py-2 text-xs font-semibold text-[#8A3D1E] transition hover:border-[#D96A3B]/40 hover:bg-[#FFF0E6] active:scale-[0.99]"
              >
                <svg
                  className="h-3.5 w-3.5 text-[#C66A43]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <span>Detect University Details</span>
              </button>
              <span className="text-[11px] text-[#A18D81]">COMSATS Lahore</span>
            </div>
          </div>

          {/* Academic Details (Compact 2-Column Grid) */}
          {detailsDetected ? (
            <div className="rounded-2xl border border-[#F0D7C5] bg-[#FFFAF6] p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-[#8A3D1E]">
                  Academic Details
                </p>
                <span className="text-[11px] font-medium text-[#C66A43]">
                  Editable
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <AuthField
                  id="campus"
                  name="campus"
                  label="Campus"
                  compact
                  value={campus}
                  onChange={(event) => setCampus(event.target.value)}
                  placeholder="Lahore"
                />

                <AuthField
                  id="batch"
                  name="batch"
                  label="Batch"
                  compact
                  value={batch}
                  onChange={(event) =>
                    setBatch(event.target.value.toUpperCase())
                  }
                  placeholder="FA23"
                />

                <AuthField
                  id="program"
                  name="program"
                  label="Program"
                  compact
                  value={program}
                  onChange={(event) =>
                    setProgram(event.target.value.toUpperCase())
                  }
                  placeholder="BSE"
                />

                <AuthField
                  id="rollNumber"
                  name="rollNumber"
                  label="Roll number"
                  compact
                  value={rollNumber}
                  onChange={(event) => setRollNumber(event.target.value)}
                  placeholder="044"
                />
              </div>

              <p className="mt-2 text-[11px] leading-4 text-[#927D71]">
                Extracted from your email. Review or update if needed.
              </p>
            </div>
          ) : (
            <>
              <input type="hidden" name="campus" value={campus} />
              <input type="hidden" name="batch" value={batch} />
              <input type="hidden" name="program" value={program} />
              <input type="hidden" name="rollNumber" value={rollNumber} />
            </>
          )}

          {errorMessage && step === 1 && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#D96535] py-3 text-[15px] font-semibold text-white transition hover:bg-[#BE5128] focus:outline-none focus:ring-2 focus:ring-[#D96535] focus:ring-offset-2 active:scale-[0.99]"
          >
            <span>Continue</span>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>

        {/* STEP 2: ACCOUNT SECURITY */}
        <div
          className={`space-y-3.5 transition-opacity duration-200 ${
            step === 2 ? "block" : "hidden"
          }`}
        >
          {/* Password with Show/Hide toggle */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold text-[#49372F]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setStepError("");
                }}
                className="w-full rounded-xl border border-[#E8DCD4] bg-[#FFFCFA] px-4 py-2.5 pr-16 text-[15px] text-[#49372F] outline-none transition placeholder:text-[#B6A49A] focus:border-[#D96A3B] focus:ring-2 focus:ring-[#FBE5D8]"
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

          {/* Confirm Password with Show/Hide toggle */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-[13px] font-semibold text-[#49372F]"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setStepError("");
                }}
                className="w-full rounded-xl border border-[#E8DCD4] bg-[#FFFCFA] px-4 py-2.5 pr-16 text-[15px] text-[#49372F] outline-none transition placeholder:text-[#B6A49A] focus:border-[#D96A3B] focus:ring-2 focus:ring-[#FBE5D8]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute inset-y-0 right-3 text-xs font-semibold text-[#B85B35] hover:text-[#8A3D1E]"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2.5 pt-0.5 text-[12px] leading-5 text-[#927D71]">
            <input
              id="agreed"
              name="agreed"
              type="checkbox"
              checked={agreed}
              onChange={(event) => {
                setAgreed(event.target.checked);
                setStepError("");
              }}
              className="mt-1 accent-[#D96535]"
            />
            <span>
              I agree to the{" "}
              <span className="font-semibold text-[#8A3D1E]">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="font-semibold text-[#8A3D1E]">
                Privacy Policy
              </span>
              .
            </span>
          </label>

          {errorMessage && step === 2 && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
            >
              {errorMessage}
            </p>
          )}

          {/* Navigation Controls: Back and Submit */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleBack}
              disabled={pending}
              className="flex items-center justify-center gap-1.5 rounded-full border border-[#E8DCD4] bg-white px-5 py-3 text-[14px] font-semibold text-[#8A3D1E] transition hover:bg-[#FFF3EA] disabled:opacity-50 active:scale-[0.99]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              <span>Back</span>
            </button>

            <div className="flex-1">
              <AuthSubmit type="submit" disabled={pending}>
                {pending ? "Creating account..." : "Create account"}
              </AuthSubmit>
            </div>
          </div>
        </div>
      </form>

      <p className="mt-5 text-center text-xs text-[#927D71]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#C45B31] transition hover:text-[#8A3D1E] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
