import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { MessageRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateMindGuardReply, AiServiceError } from "@/app/lib/openai";

const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().trim().min(1, "Message cannot be empty").max(4000, "Message exceeds 4000 characters limit"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const conversationId = request.nextUrl.searchParams.get("conversationId");

    if (!conversationId || !z.string().uuid().safeParse(conversationId).success) {
      return NextResponse.json(
        { error: "A valid conversationId is required" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        studentId: session.user.id,
      },
      select: { id: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        studentId: session.user.id,
      },
      orderBy: { seq: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        seq: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to load messages:", error);

    return NextResponse.json(
      { error: "Unable to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const rawBody = await request.text();

    if (rawBody.length > 12_000) {
      return NextResponse.json(
        { error: "Request body is too large" },
        { status: 413 }
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = createMessageSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid message data";
      return NextResponse.json(
        { error: issue },
        { status: 400 }
      );
    }

    const { conversationId, content } = parsed.data;
    const studentId = session.user.id;

    // Verify conversation exists and belongs to the authenticated student
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        studentId,
        endedAt: null,
      },
      select: {
        id: true,
        summary: true,
        messageCount: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Active conversation not found" },
        { status: 404 }
      );
    }

    // Deduplication check: Check if an identical student message was created in the last 8 seconds
    const recentDuplicate = await prisma.message.findFirst({
      where: {
        conversationId,
        studentId,
        role: MessageRole.student,
        content,
        createdAt: {
          gte: new Date(Date.now() - 8_000),
        },
      },
      orderBy: { seq: "desc" },
    });

    if (recentDuplicate) {
      // If assistant response for it already exists, return both
      const existingAssistantMsg = await prisma.message.findFirst({
        where: {
          conversationId,
          seq: recentDuplicate.seq + 1,
          role: MessageRole.assistant,
        },
        select: {
          id: true,
          role: true,
          content: true,
          seq: true,
          createdAt: true,
        },
      });

      if (existingAssistantMsg) {
        return NextResponse.json({
          message: {
            id: recentDuplicate.id,
            role: recentDuplicate.role,
            content: recentDuplicate.content,
            seq: recentDuplicate.seq,
            createdAt: recentDuplicate.createdAt.toISOString(),
          },
          assistantMessage: existingAssistantMsg,
        });
      }
    }

    // Load recent conversation history in chronological order for OpenAI context
    const recentHistory = await prisma.message.findMany({
      where: {
        conversationId,
        studentId,
      },
      orderBy: { seq: "asc" },
      take: 20,
      select: {
        role: true,
        content: true,
      },
    });

    // Generate real response using official OpenAI SDK and Responses API
    const aiResponse = await generateMindGuardReply({
      history: recentHistory,
      userMessage: content,
    });

    // Save both student message and AI assistant response atomically in a database transaction
    const saved = await prisma.$transaction(async (tx) => {
      // Lock conversation row
      await tx.$queryRaw`
        SELECT id
        FROM conversations
        WHERE id = ${conversationId}::uuid
          AND student_id = ${studentId}::uuid
        FOR UPDATE
      `;

      const lastMessage = await tx.message.findFirst({
        where: { conversationId },
        orderBy: { seq: "desc" },
        select: { seq: true },
      });

      const studentSeq = (lastMessage?.seq ?? 0) + 1;
      const assistantSeq = studentSeq + 1;

      const createdStudent = await tx.message.create({
        data: {
          conversationId,
          studentId,
          seq: studentSeq,
          role: MessageRole.student,
          content,
        },
        select: {
          id: true,
          role: true,
          content: true,
          seq: true,
          createdAt: true,
        },
      });

      const createdAssistant = await tx.message.create({
        data: {
          conversationId,
          studentId,
          seq: assistantSeq,
          role: MessageRole.assistant,
          content: aiResponse.content,
          tokenCount: aiResponse.tokenCount ?? null,
        },
        select: {
          id: true,
          role: true,
          content: true,
          seq: true,
          createdAt: true,
        },
      });

      // Update conversation summary if empty
      const summaryUpdate = !conversation.summary
        ? content.length > 45
          ? `${content.slice(0, 45)}...`
          : content
        : undefined;

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          messageCount: { increment: 2 },
          ...(summaryUpdate ? { summary: summaryUpdate } : {}),
        },
      });

      return {
        studentMessage: createdStudent,
        assistantMessage: createdAssistant,
      };
    });

    return NextResponse.json(
      {
        message: saved.studentMessage,
        assistantMessage: saved.assistantMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to process message:", error);

    return NextResponse.json(
      { error: "Unable to send your message right now. Please try again." },
      { status: 500 }
    );
  }
}
