import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getMessages,
  saveMessage,
  generateId,
  SimpleMessage,
  getChannels,
} from "@/lib/simpleStorage";

export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await getMessages(params.channelId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, senderId } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Message text required" },
        { status: 400 },
      );
    }

    const message: SimpleMessage = {
      id: generateId(),
      channelId: params.channelId,
      senderId: senderId || (session.user?.id as string),
      senderName: session.user?.name || "User",
      text: text.trim(),
      timestamp: Date.now(),
    };

    await saveMessage(message);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 },
    );
  }
}
