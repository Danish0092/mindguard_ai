import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { checkRateLimit } from "@/app/lib/rate-limit";

const registrationSchema = z.object({
  displayName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  university: z.string().trim().min(2).max(150),
  program: z.string().trim().max(150).optional(),
  yearOfStudy: z.number().int().min(1).max(10).optional(),
});

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length");

    if (contentLength && Number(contentLength) > 10_000) {
      return NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 },
      );
    }
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";

    const rateLimit = checkRateLimit(`register:${clientIp}`, 5, 60_000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter ?? 60),
          },
        },
      );
    }
    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).byteLength > 10_000) {
      return NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 },
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration details." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const email = data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        displayName: data.displayName,
        email,
        passwordHash,
        university: data.university,
        program: data.program || null,
        yearOfStudy: data.yearOfStudy ?? null,
        role: "student",
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        university: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully.", user },
      { status: 201 },
    );
  } catch (error) {
    // Handle concurrent duplicate registrations safely.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    console.error("Registration failed:", error);

    return NextResponse.json(
      { error: "Unable to create your account right now." },
      { status: 500 },
    );
  }
}
