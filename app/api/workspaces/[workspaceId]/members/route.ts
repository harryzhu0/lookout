import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getWorkspace,
  saveWorkspace,
  getUserByEmail,
  saveUserFromSession,
} from "@/lib/simpleStorage";

// Helper to get workspaceId from URL
function getWorkspaceIdFromUrl(url: string): string | null {
  const match = url.match(/\/api\/workspaces\/([^\/]+)\/members/);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest, context: any) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspaceId from URL path
    const workspaceId = getWorkspaceIdFromUrl(request.url);
    console.log("Members GET - workspaceId from URL:", workspaceId);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID not found in URL" },
        { status: 400 },
      );
    }

    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      console.log("Workspace not found for ID:", workspaceId);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      members: workspace.members,
      ownerId: workspace.ownerId,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: any) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspaceId from URL path
    const workspaceId = getWorkspaceIdFromUrl(request.url);
    console.log("Members POST - workspaceId from URL:", workspaceId);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID not found in URL" },
        { status: 400 },
      );
    }

    // Save current user to users.json if not exists
    await saveUserFromSession(session);

    const { email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      console.log("Workspace not found for ID:", workspaceId);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    console.log("Found workspace:", workspace.name);

    // Check if current user is admin or owner
    const currentUserIsOwner = workspace.ownerId === session.user?.id;
    const currentUserIsAdmin = workspace.members.some(
      (m) => m.userId === session.user?.id && m.role === "admin",
    );

    if (!currentUserIsOwner && !currentUserIsAdmin) {
      return NextResponse.json(
        { error: "Only workspace admins can add members" },
        { status: 403 },
      );
    }

    // Find user by email
    const targetUser = await getUserByEmail(email);

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "User not found. Make sure they have signed in to LOOKOUT at least once.",
        },
        { status: 404 },
      );
    }

    console.log("Found user:", targetUser.name, targetUser.email);

    // Check if already a member
    const isMember = workspace.members.some((m) => m.userId === targetUser.uid);
    if (isMember) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 400 },
      );
    }

    // Add user to workspace
    const newMember = {
      userId: targetUser.uid,
      userName: targetUser.name || targetUser.email.split("@")[0],
      userEmail: targetUser.email,
      userAvatar: targetUser.avatar,
      role: role || "member",
      joinedAt: Date.now(),
    };

    workspace.members.push(newMember);
    await saveWorkspace(workspace);

    console.log("Added member:", newMember.userName);

    return NextResponse.json({
      member: newMember,
      message: `Successfully added ${newMember.userName} to the workspace!`,
    });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member: " + String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspaceId from URL path
    const workspaceId = getWorkspaceIdFromUrl(request.url);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID not found in URL" },
        { status: 400 },
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // Check if current user is admin or owner
    const currentUserIsOwner = workspace.ownerId === session.user?.id;
    const currentUserIsAdmin = workspace.members.some(
      (m) => m.userId === session.user?.id && m.role === "admin",
    );

    if (!currentUserIsOwner && !currentUserIsAdmin) {
      return NextResponse.json(
        { error: "Only workspace admins can remove members" },
        { status: 403 },
      );
    }

    // Cannot remove the owner
    if (userId === workspace.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove the workspace owner" },
        { status: 400 },
      );
    }

    // Remove member
    workspace.members = workspace.members.filter((m) => m.userId !== userId);
    await saveWorkspace(workspace);

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 },
    );
  }
}
