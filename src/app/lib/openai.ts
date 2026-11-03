import OpenAI, {
  APIConnectionTimeoutError,
  AuthenticationError,
  RateLimitError,
} from "openai";

export const MINDGUARD_SYSTEM_PROMPT =
  "You are MindGuard AI, a warm, empathetic, non-judgmental mental wellness companion for university students. Listen carefully, acknowledge the student's feelings, and respond in natural, simple, supportive language. Help students reflect on stress, academic pressure, motivation, relationships, and everyday emotional challenges. Ask one thoughtful follow-up question when useful and suggest small, practical coping steps without overwhelming the student. Never diagnose mental health conditions, prescribe medication, or claim to replace a qualified mental health professional. Do not pretend to be human. Respect privacy and avoid requesting unnecessary personal information. If a student expresses immediate danger or possible self-harm, respond compassionately, encourage them to contact a trusted person and appropriate local emergency or crisis support, and follow any existing MindGuard AI safety escalation workflow. Do not invent emergency contact details.";

export class AiServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AiServiceError";
    this.statusCode = statusCode;
  }
}

export type ChatHistoryItem = {
  role: "student" | "assistant" | "counselor";
  content: string;
};

let cachedClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new AiServiceError(
      "MindGuard AI is temporarily unavailable because the API key is not configured. Please ensure OPENAI_API_KEY is set in your environment.",
      503
    );
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey,
      timeout: 30_000,
      maxRetries: 2,
    });
  }

  return cachedClient;
}

export async function generateMindGuardReply({
  history,
  userMessage,
}: {
  history: ChatHistoryItem[];
  userMessage: string;
}): Promise<{ content: string; tokenCount?: number }> {
  const client = getOpenAIClient();
  const model = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();

  // Prepare chronological input for OpenAI Responses API
  const inputItems: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const item of history) {
    inputItems.push({
      role: item.role === "student" ? "user" : "assistant",
      content: item.content,
    });
  }

  inputItems.push({
    role: "user",
    content: userMessage,
  });

  try {
    // 1. Primary: Use the OpenAI Responses API
    const response = await client.responses.create({
      model,
      instructions: MINDGUARD_SYSTEM_PROMPT,
      input: inputItems,
    });

    const outputText = response.output_text?.trim();

    if (outputText) {
      return {
        content: outputText,
        tokenCount: response.usage?.total_tokens ?? undefined,
      };
    }

    // Fallback extraction from response.output array if output_text was blank
    if (Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === "message" && Array.isArray(item.content)) {
          for (const part of item.content) {
            if ("text" in part && typeof part.text === "string" && part.text.trim()) {
              return {
                content: part.text.trim(),
                tokenCount: response.usage?.total_tokens ?? undefined,
              };
            }
          }
        }
      }
    }

    throw new Error("No text content returned in OpenAI response.");
  } catch (err: unknown) {
    // If the model does not support Responses API or fails, try Chat Completions fallback
    if (
      err instanceof Error &&
      !err.message.includes("API key") &&
      !(err instanceof RateLimitError) &&
      !(err instanceof AuthenticationError) &&
      !(err instanceof APIConnectionTimeoutError)
    ) {
      try {
        const completion = await client.chat.completions.create({
          model,
          messages: [
            { role: "system", content: MINDGUARD_SYSTEM_PROMPT },
            ...inputItems.map((item) => ({
              role: item.role,
              content: item.content,
            })),
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        const choiceText = completion.choices[0]?.message?.content?.trim();
        if (choiceText) {
          return {
            content: choiceText,
            tokenCount: completion.usage?.total_tokens ?? undefined,
          };
        }
      } catch (fallbackErr) {
        console.error("OpenAI chat completion fallback failed:", fallbackErr);
      }
    }

    // Handle known error categories safely without exposing raw errors to client
    if (err instanceof RateLimitError) {
      console.warn("OpenAI RateLimitError encountered:", err.message);
      throw new AiServiceError(
        "MindGuard AI is receiving a high volume of conversations right now. Please take a breath and try again in a few moments.",
        429
      );
    }

    if (err instanceof AuthenticationError) {
      console.error("OpenAI AuthenticationError: Invalid API key or configuration.");
      throw new AiServiceError(
        "MindGuard AI authentication is currently unavailable. Please check server configuration.",
        503
      );
    }

    if (err instanceof APIConnectionTimeoutError) {
      console.warn("OpenAI APIConnectionTimeoutError: request timed out.");
      throw new AiServiceError(
        "MindGuard AI took a little too long to respond. Please try sending your message again.",
        504
      );
    }

    if (err instanceof AiServiceError) {
      throw err;
    }

    console.error("OpenAI service unexpected error:", err);
    throw new AiServiceError(
      "We're having trouble connecting to MindGuard AI right now. Please try again in a moment.",
      502
    );
  }
}
