import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getWorkspaces, getAllUsers } from "@/lib/simpleStorage";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaces = await getWorkspaces();
    const users = await getAllUsers();

    return NextResponse.json({
      workspaces: Object.values(workspaces).map((w) => ({
        id: w.id,
        name: w.name,
        memberCount: w.members.length,
        members: w.members.map((m) => ({
          name: m.userName,
          email: m.userEmail,
        })),
      })),
      users: users.map((u) => ({ name: u.name, email: u.email, uid: u.uid })),
      currentUser: {
        id: session.user?.id,
        name: session.user?.name,
        email: session.user?.email,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
