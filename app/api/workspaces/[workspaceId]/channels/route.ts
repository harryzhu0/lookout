import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getWorkspace,
  getWorkspaceChannels,
  saveChannel,
  generateId,
} from "@/lib/storage";
import { Channel } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channels = await getWorkspaceChannels(params.workspaceId);
  return NextResponse.json({ channels });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, type, creatorId } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Channel name required" },
        { status: 400 },
      );
    }

    const workspace = await getWorkspace(params.workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    const channel: Channel = {
      id: generateId(),
      workspaceId: params.workspaceId,
      name: name.trim(),
      type: type === "private" ? "private" : "public",
      admins: [creatorId || (session.user?.id as string)],
      members: [creatorId || (session.user?.id as string)],
      createdAt: Date.now(),
      createdBy: creatorId || (session.user?.id as string),
    };

    await saveChannel(channel);

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Error creating channel:", error);
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 },
    );
  }
}
