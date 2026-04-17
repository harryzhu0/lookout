import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getMessages,
  saveMessage,
  generateId,
  getChannels,
  getWorkspace,
} from "@/lib/storage";
import { ChatMessage } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { channelId: string } },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
  req: NextRequest,
  { params }: { params: { channelId: string } },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text, senderId } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Message text required" },
        { status: 400 },
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 },
      );
    }

    // Get channel to find workspace ID
    const channels = await getChannels();
    const channel = channels[params.channelId];

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const message: ChatMessage = {
      id: generateId(),
      channelId: params.channelId,
      workspaceId: channel.workspaceId,
      senderId: senderId || (session.user?.id as string),
      senderName: session.user?.name || "User",
      senderAvatar: session.user?.image,
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
