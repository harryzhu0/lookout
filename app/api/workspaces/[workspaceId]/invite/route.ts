import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getWorkspace,
  saveWorkspace,
  generateInviteCode,
} from "@/lib/simpleStorage";

function getWorkspaceIdFromUrl(url: string): string | null {
  const match = url.match(/\/api\/workspaces\/([^\/]+)\/invite/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = getWorkspaceIdFromUrl(request.url);
    console.log("Invite POST - workspaceId from URL:", workspaceId);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID not found in URL" },
        { status: 400 },
      );
    }

    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // Check if user is admin or owner
    const isAdmin = workspace.members.some(
      (m) => m.userId === session.user?.id && m.role === "admin",
    );
    const isOwner = workspace.ownerId === session.user?.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Only workspace admins can generate invite codes" },
        { status: 403 },
      );
    }

    // Generate new invite code
    const inviteCode = generateInviteCode();
    workspace.inviteCode = inviteCode;
    await saveWorkspace(workspace);

    return NextResponse.json({ inviteCode });
  } catch (error) {
    console.error("Error generating invite code:", error);
    return NextResponse.json(
      { error: "Failed to generate invite code: " + String(error) },
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

    const workspaceId = getWorkspaceIdFromUrl(request.url);
    console.log("Invite GET - workspaceId from URL:", workspaceId);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID not found in URL" },
        { status: 400 },
      );
    }

    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ inviteCode: workspace.inviteCode });
  } catch (error) {
    console.error("Error getting invite code:", error);
    return NextResponse.json(
      { error: "Failed to get invite code" },
      { status: 500 },
    );
  }
}
