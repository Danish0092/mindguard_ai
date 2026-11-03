
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(12).max(128),
  displayName: z.string().trim().min(2).max(100),
  university: z.string().trim().min(2).max(150),
});

async function main() {
  const parsed = schema.safeParse({
    email: process.env.COUNSELOR_EMAIL,
    password: process.env.COUNSELOR_PASSWORD,
    displayName: process.env.COUNSELOR_NAME,
    university: process.env.COUNSELOR_UNIVERSITY,
  });

  if (!parsed.success) {
    throw new Error(
      "Set valid COUNSELOR_EMAIL, COUNSELOR_PASSWORD, COUNSELOR_NAME, and COUNSELOR_UNIVERSITY environment variables.",
    );
  }

  const data = parsed.data;
  const passwordHash = await hash(data.password, 12);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true, role: true },
  });

  if (existing && existing.role !== "counselor") {
    throw new Error(
      "This email already belongs to a non-counselor account. Use a different email.",
    );
  }

  const counselor = await prisma.user.upsert({
    where: { email: data.email },
    update: {
      displayName: data.displayName,
      university: data.university,
      passwordHash,
      role: "counselor",
      isActive: true,
    },
    create: {
      displayName: data.displayName,
      email: data.email,
      passwordHash,
      university: data.university,
      role: "counselor",
    },
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
    },
  });

  console.log("Counselor account ready:", counselor);
}

main()
  .catch((error) => {
    console.error("Counselor setup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
