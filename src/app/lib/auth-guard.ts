
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type AppRole = "student" | "counselor" | "admin";

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}

export async function requireRole(...allowedRoles: AppRole[]) {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role as AppRole)) {
    redirect("/dashboard");
  }

  return user;
}
