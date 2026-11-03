import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = session.user.id;
    const searchParam = request.nextUrl.searchParams.get("search")?.trim() || "";

    const where: Prisma.ConversationWhereInput = {
      studentId,
    };

    if (searchParam) {
      where.OR = [
        {
          summary: {
            contains: searchParam,
            mode: "insensitive",
          },
        },
        {
          messages: {
            some: {
              content: {
                contains: searchParam,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: {
        startedAt: "desc",
      },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        messageCount: true,
        summary: true,
        messages: {
          orderBy: { seq: "asc" },
          take: 1,
          select: {
            content: true,
          },
        },
      },
    });

    const formatted = conversations.map((c) => {
      const firstMessageText = c.messages[0]?.content?.trim() || "";
      const displayTitle = c.summary?.trim() || firstMessageText || "New conversation";

      return {
        id: c.id,
        startedAt: c.startedAt.toISOString(),
        endedAt: c.endedAt ? c.endedAt.toISOString() : null,
        messageCount: c.messageCount,
        title: displayTitle.length > 50 ? `${displayTitle.slice(0, 50)}...` : displayTitle,
        preview: firstMessageText,
      };
    });

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error("Failed to load conversations:", error);
    return NextResponse.json(
      { error: "Unable to load conversations" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = session.user.id;

    const conversation = await prisma.conversation.create({
      data: {
        studentId,
      },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        messageCount: true,
        summary: true,
      },
    });

    return NextResponse.json(
      {
        conversation: {
          id: conversation.id,
          startedAt: conversation.startedAt.toISOString(),
          endedAt: null,
          messageCount: conversation.messageCount,
          title: "New conversation",
          preview: "",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Unable to create conversation" },
      { status: 500 }
    );
  }
}

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = session.user.id;
    const urlId = request.nextUrl.searchParams.get("id");

    let conversationId = urlId;

    if (!conversationId) {
      try {
        const body = await request.json();
        conversationId = body.id;
      } catch {
        // no body
      }
    }

    const parsed = deleteSchema.safeParse({ id: conversationId });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid conversation ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.conversation.findFirst({
      where: {
        id: parsed.data.id,
        studentId,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    await prisma.conversation.delete({
      where: {
        id: parsed.data.id,
      },
    });

    return NextResponse.json({ success: true, id: parsed.data.id });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return NextResponse.json(
      { error: "Unable to delete conversation" },
      { status: 500 }
    );
  }
}
