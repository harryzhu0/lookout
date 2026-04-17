import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getWorkspaces, saveWorkspace, generateId } from "@/lib/storage";
import { Workspace } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaces = await getWorkspaces();
    const userWorkspaces = Object.values(workspaces).filter(
      (ws) =>
        ws.members.includes(session.user?.id as string) ||
        ws.ownerId === session.user?.id,
    );

    return NextResponse.json({ workspaces: userWorkspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Workspace name required" },
        { status: 400 },
      );
    }

    const workspace: Workspace = {
      id: generateId(),
      name: name.trim(),
      ownerId: session.user?.id as string,
      admins: [session.user?.id as string],
      members: [session.user?.id as string],
      channels: [],
      createdAt: Date.now(),
    };

    await saveWorkspace(workspace);
    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 },
    );
  }
}
