import { auth } from "@/auth";
import { getHistory, saveMessage, clearHistory, ChatMessage } from "@/lib/chatHistory";
import { NextRequest, NextResponse } from "next/server";

const MAX_MESSAGE_LENGTH = 10000;

// Sanitize text input
function sanitizeText(text: unknown): string {
  if (typeof text !== "string") {
    throw new Error("Message must be a string");
  }
  
  // Trim and check length
  const sanitized = text.trim();
  if (sanitized.length === 0) {
    throw new Error("Message cannot be empty");
  }
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH}`);
  }
  
  return sanitized;
}

// GET /api/chat - Retrieve chat history
export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await getHistory();
    return NextResponse.json({ history });
  } catch (err) {
    console.error("Error reading chat history:", err);
    return NextResponse.json(
      { error: "Failed to retrieve history" },
      { status: 500 }
    );
  }
}

// POST /api/chat - Add a new message
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const text = sanitizeText(body.text);

    const message: ChatMessage = {
      sender: session.user?.name || session.user?.email || "Anonymous",
      text,
      timestamp: Date.now(),
    };

    await saveMessage(message);

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save message";
    console.error("Error saving message:", err);
    
    // Don't leak implementation details
    if (errorMsg.includes("Chat history file too large")) {
      return NextResponse.json(
        { error: "Server storage limit exceeded" },
        { status: 507 }
      );
    }
    
    return NextResponse.json(
      { error: errorMsg.startsWith("Message") ? errorMsg : "Failed to save message" },
      { status: 400 }
    );
  }
}

// DELETE /api/chat - Clear chat history
export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await clearHistory();
    return NextResponse.json({ message: "Chat history cleared" });
  } catch (err) {
    console.error("Error clearing history:", err);
    return NextResponse.json(
      { error: "Failed to clear history" },
      { status: 500 }
    );
  }
}

