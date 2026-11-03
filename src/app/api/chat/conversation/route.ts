import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = session.user.id;

    let conversation = await prisma.conversation.findFirst({
      where: {
        studentId,
        endedAt: null,
      },
      orderBy: {
        startedAt: "desc",
      },
      select: {
        id: true,
        startedAt: true,
        messageCount: true,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          studentId,
        },
        select: {
          id: true,
          startedAt: true,
          messageCount: true,
        },
      });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Failed to load chat conversation:", error);

    return NextResponse.json(
      { error: "Unable to load conversation" },
      { status: 500 },
    );
  }
}
