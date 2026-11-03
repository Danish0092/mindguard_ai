
"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { sendVerificationCode } from "@/app/lib/resend";

export type VerificationResult = { error: string } | undefined;

const CODE_EXPIRY_MS = 10 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_EMAILS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

export async function verifyEmailCode(
  _previousState: VerificationResult,
  formData: FormData,
): Promise<VerificationResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !/^\d{6}$/.test(code)) {
    return { error: "Enter the six-digit verification code." };
  }

  try {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });

    if (!pending) {
      return {
        error: "Registration not found or already completed. Please register again.",
      };
    }

    if (pending.expiresAt.getTime() <= Date.now()) {
      return { error: "Your code has expired. Please request a new one." };
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      return {
        error: "Too many incorrect attempts. Please request a new code.",
      };
    }

    // Atomically consume one attempt before checking the submitted code.
    const attempt = await prisma.pendingRegistration.updateMany({
      where: {
        email,
        expiresAt: { gt: new Date() },
        attempts: { lt: MAX_ATTEMPTS },
      },
      data: { attempts: { increment: 1 } },
    });

    if (attempt.count !== 1) {
      return {
        error: "Your code has expired or the attempt limit has been reached. Request a new code.",
      };
    }

    const current = await prisma.pendingRegistration.findUnique({
      where: { email },
    });

    if (!current) {
      return { error: "Registration not found. Please register again." };
    }

    const matches = await bcrypt.compare(
      code,
      current.verificationCodeHash,
    );

    if (!matches) {
      const attemptsLeft = Math.max(0, MAX_ATTEMPTS - current.attempts);
      return {
        error: attemptsLeft
          ? `Incorrect code. You have ${attemptsLeft} attempt(s) left.`
          : "Too many incorrect attempts. Please request a new code.",
      };
    }

    // Recheck expiry and use a transaction so the account and pending
    // registration are changed together.
    await prisma.$transaction(async (tx) => {
      const stillPending = await tx.pendingRegistration.findUnique({
        where: { email },
      });

      if (
        !stillPending ||
        stillPending.expiresAt.getTime() <= Date.now() ||
        stillPending.verificationCodeHash !== current.verificationCodeHash
      ) {
        throw new Error("CODE_NO_LONGER_VALID");
      }

      await tx.user.create({
        data: {
          email: stillPending.email,
          displayName: stillPending.displayName,
          university: stillPending.university,
          passwordHash: stillPending.passwordHash,
          role: "student",
          campus: stillPending.campus,
          batch: stillPending.batch,
          program: stillPending.program,
          rollNumber: stillPending.rollNumber,
        },
      });

      await tx.pendingRegistration.delete({
        where: { email },
      });
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CODE_NO_LONGER_VALID"
    ) {
      return {
        error: "This code is no longer valid. Please request a new one.",
      };
    }

    // Prisma unique-constraint error: another request may have completed
    // registration for this email first.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        error: "An account with this email already exists. Please sign in.",
      };
    }

    console.error("Email verification failed:", error);
    return { error: "Unable to verify your code. Please try again." };
  }

  redirect("/login?registered=true");
}

export async function resendVerificationCode(
  _previousState: VerificationResult,
  formData: FormData,
): Promise<VerificationResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { error: "Your email address is missing. Please register again." };
  }

  try {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });

    if (!pending) {
      return {
        error: "No pending registration was found. Please register again.",
      };
    }

    const now = new Date();
    const elapsed = now.getTime() - pending.lastSentAt.getTime();

    if (elapsed < COOLDOWN_MS) {
      const seconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return {
        error: `Please wait ${seconds} second(s) before requesting another code.`,
      };
    }

    const emailsSent =
      elapsed >= WINDOW_MS ? 1 : pending.resendCount + 1;

    if (emailsSent > MAX_EMAILS_PER_HOUR) {
      return {
        error: "You have reached the email limit. Please try again later.",
      };
    }

    const code = (await import("node:crypto")).randomInt(0, 1_000_000)
      .toString()
      .padStart(6, "0");

    const verificationCodeHash = await bcrypt.hash(code, 10);

    await sendVerificationCode(email, code);

    await prisma.pendingRegistration.update({
      where: { email },
      data: {
        verificationCodeHash,
        expiresAt: new Date(now.getTime() + CODE_EXPIRY_MS),
        attempts: 0,
        resendCount: emailsSent,
        lastSentAt: now,
      },
    });

    return undefined;
  } catch (error) {
    console.error("Resending verification code failed:", error);
    return {
      error: "Unable to resend the code. Please try again shortly.",
    };
  }
}
