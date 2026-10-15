
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export type AppRole = "student" | "counselor" | "admin";

export async function requireApiUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  return {
    user: session.user,
    response: null,
  };
}

export async function requireApiRole(...allowedRoles: AppRole[]) {
  const result = await requireApiUser();

  if (result.response) {
    return result;
  }

  if (!allowedRoles.includes(result.user!.role as AppRole)) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "You don't have permission to perform this action." },
        { status: 403 }
      ),
    };
  }

  return result;
}
