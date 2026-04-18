import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getWorkspaces,
  saveWorkspace,
  getChannels,
  saveChannel,
  generateId,
  SimpleChannel,
} from "@/lib/simpleStorage";

export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.workspaceId;
    console.log(
      "POST /api/workspaces/[workspaceId]/channels - workspaceId:",
      workspaceId,
    );

    // Get all workspaces
    const workspaces = await getWorkspaces();
    console.log("Available workspace IDs:", Object.keys(workspaces));

    const workspace = workspaces[workspaceId];

    if (!workspace) {
      return NextResponse.json(
        {
          error: "Workspace not found",
          workspaceId: workspaceId,
          availableWorkspaceIds: Object.keys(workspaces),
        },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, type } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Channel name required" },
        { status: 400 },
      );
    }

    const channel: SimpleChannel = {
      id: generateId(),
      workspaceId: workspaceId,
      name: name.trim(),
      type: type === "private" ? "private" : "public",
      messages: [],
      createdAt: Date.now(),
    };

    // Save channel
    await saveChannel(channel);

    // Add channel to workspace
    workspace.channels.push(channel);
    await saveWorkspace(workspace);

    console.log("Channel created:", channel.id, channel.name);
    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Error creating channel:", error);
    return NextResponse.json(
      { error: "Failed to create channel: " + String(error) },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaces = await getWorkspaces();
    const workspace = workspaces[params.workspaceId];

    if (!workspace) {
      return NextResponse.json({ channels: [] });
    }

    // Get full channel details
    const allChannels = await getChannels();
    const workspaceChannels = workspace.channels
      .map((channelRef) => allChannels[channelRef.id])
      .filter(Boolean);

    return NextResponse.json({ channels: workspaceChannels });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 },
    );
  }
}
