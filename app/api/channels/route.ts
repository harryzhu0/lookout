import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

async function getWorkspaces() {
  try {
    const data = await fs.readFile(
      path.join(DATA_DIR, "workspaces.json"),
      "utf-8",
    );
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveWorkspaces(workspaces: any) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, "workspaces.json"),
    JSON.stringify(workspaces, null, 2),
  );
}

async function getChannels() {
  try {
    const data = await fs.readFile(
      path.join(DATA_DIR, "channels.json"),
      "utf-8",
    );
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveChannels(channels: any) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, "channels.json"),
    JSON.stringify(channels, null, 2),
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, workspaceId } = body;

    console.log("Creating channel:", { name, type, workspaceId });

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Channel name required" },
        { status: 400 },
      );
    }

    // Verify workspace exists
    const workspaces = await getWorkspaces();
    const workspace = workspaces[workspaceId];

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // Create channel
    const channels = await getChannels();
    const channelId = crypto.randomBytes(16).toString("hex");

    const channel = {
      id: channelId,
      workspaceId: workspaceId,
      name: name.trim(),
      type: type === "private" ? "private" : "public",
      messages: [],
      createdAt: Date.now(),
    };

    channels[channelId] = channel;
    await saveChannels(channels);

    // Add channel to workspace
    if (!workspace.channels) {
      workspace.channels = [];
    }
    workspace.channels.push(channel);
    await saveWorkspaces(workspaces);

    console.log("Channel created:", channel);
    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Error creating channel:", error);
    return NextResponse.json(
      { error: "Failed to create channel: " + String(error) },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    const channels = await getChannels();
    const workspaceChannels = Object.values(channels).filter(
      (c: any) => c.workspaceId === workspaceId,
    );

    return NextResponse.json({ channels: workspaceChannels });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 },
    );
  }
}
