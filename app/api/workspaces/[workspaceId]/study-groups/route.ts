import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getStudyGroups, saveStudyGroup, generateId } from "@/lib/storage";
import { StudyGroup } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groups = await getStudyGroups();
  const workspaceGroups = Object.values(groups).filter(
    (g) => g.workspaceId === params.workspaceId,
  );

  return NextResponse.json({ groups: workspaceGroups });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, creatorId } = await req.json();
  if (!name)
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  const group: StudyGroup = {
    id: generateId(),
    workspaceId: params.workspaceId,
    name,
    description: description || "",
    createdBy: creatorId || (session.user?.id as string),
    members: [creatorId || (session.user?.id as string)],
    posts: [],
    createdAt: Date.now(),
  };

  await saveStudyGroup(group);
  return NextResponse.json(group, { status: 201 });
}
