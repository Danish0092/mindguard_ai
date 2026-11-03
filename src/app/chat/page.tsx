import { requireRole } from "@/app/lib/auth-guard";
import ChatInterface from "./chat-interface";

export default async function ChatPage() {
  const user = await requireRole("student");

  return (
    <ChatInterface
      currentUser={{
        id: user.id,
        name: user.name || "Student",
        email: user.email || "",
      }}
    />
  );
}
