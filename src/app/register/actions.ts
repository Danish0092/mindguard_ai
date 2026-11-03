"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { parseStudentUniversityEmail } from "@/app/lib/university-email";
import { sendVerificationCode } from "@/app/lib/resend";
import { redirect } from "next/navigation";

export type SignupResult = { error: string } | undefined;

const signupSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Please enter your full name (at least 2 characters).")
      .max(100),
    university: z
      .string()
      .trim()
      .max(150)
      .optional()
      .transform(
        (value) => value || "COMSATS University Islamabad, Lahore Campus",
      ),
    campus: z.string().trim().max(100).optional(),
    batch: z.string().trim().max(50).optional(),
    program: z.string().trim().max(50).optional(),
    rollNumber: z.string().trim().max(50).optional(),
    email: z.string().trim().email("Please enter a valid email.").max(254),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72),
    confirmPassword: z.string().min(8, "Please confirm your password.").max(72),
    agreed: z
      .boolean()
      .refine(
        (value) => value,
        "Please accept the Terms of Service and Privacy Policy.",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function signup(
  _previousState: SignupResult,
  formData: FormData,
): Promise<SignupResult> {
  const parsed = signupSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    university: String(formData.get("university") ?? ""),
    campus: String(formData.get("campus") ?? ""),
    batch: String(formData.get("batch") ?? ""),
    program: String(formData.get("program") ?? ""),
    rollNumber: String(formData.get("rollNumber") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    agreed:
      formData.get("agreed") === "on" || formData.get("agreed") === "true",
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Please check your information.",
    };
  }

  const { displayName, university, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  // Validate and extract the student's university details.
  const studentDetails = parseStudentUniversityEmail(email);

  if (!studentDetails) {
    return {
      error:
        "Please use a valid COMSATS Lahore student email, such as FA23-BSE-044@cuilahore.edu.pk.",
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        error: "An account with this email already exists. Please sign in.",
      };
    }

    const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
    const verificationCodeHash = await bcrypt.hash(code, 10);
    const passwordHash = await bcrypt.hash(password, 12);

    await sendVerificationCode(email, code);

    const campus = (parsed.data.campus || studentDetails.campus).trim();
    const batch = (
      parsed.data.batch || studentDetails.batch
    ).trim().toUpperCase();
    const program = (
      parsed.data.program || studentDetails.program
    ).trim().toUpperCase();
    const rollNumber = (
      parsed.data.rollNumber || studentDetails.rollNumber
    ).trim();

    await prisma.pendingRegistration.upsert({
      where: { email },
      update: {
        displayName,
        university,
        passwordHash,
        campus,
        batch,
        program,
        rollNumber,
        verificationCodeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        resendCount: 0,
        lastSentAt: new Date(),
        agreedToTerms: true,
      },
      create: {
        email,
        displayName,
        university,
        passwordHash,
        campus,
        batch,
        program,
        rollNumber,
        verificationCodeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        resendCount: 0,
        lastSentAt: new Date(),
        agreedToTerms: true,
      },
    });
  } catch (error) {
    console.error("Signup failed:", error);

    return {
      error:
        error instanceof Error && error.message.includes("Resend")
          ? "Unable to send the verification email. Please check your email and try again."
          : "Unable to process your registration. Please try again.",
    };
  }

  redirect(`/register/verify?email=${encodeURIComponent(email)}`);
}
