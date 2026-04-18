import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getWorkspace, saveWorkspace, getUsers } from "@/lib/simpleStorage";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code required" },
        { status: 400 },
      );
    }

    // Find workspace with this invite code
    const workspaces = await getWorkspaces();
    const workspace = Object.values(workspaces).find(
      (w) => w.inviteCode === inviteCode,
    );

    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 },
      );
    }

    // Check if user is already a member
    const isMember = workspace.members.some(
      (m) => m.userId === session.user?.id,
    );
    if (isMember) {
      return NextResponse.json(
        { error: "You are already a member of this workspace" },
        { status: 400 },
      );
    }

    // Add user to workspace
    workspace.members.push({
      userId: session.user?.id as string,
      userName: session.user?.name || "User",
      userEmail: session.user?.email || "",
      userAvatar: session.user?.image,
      role: "member",
      joinedAt: Date.now(),
    });

    await saveWorkspace(workspace);

    return NextResponse.json({
      workspace,
      message: "Successfully joined workspace!",
    });
  } catch (error) {
    console.error("Error joining workspace:", error);
    return NextResponse.json(
      { error: "Failed to join workspace" },
      { status: 500 },
    );
  }
}
