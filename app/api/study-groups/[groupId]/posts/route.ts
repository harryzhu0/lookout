import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getStudyGroups,
  saveStudyGroup,
  generateId,
  addStudyPost,
} from "@/lib/storage";
import { StudyPost } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, authorId } = await req.json();
  if (!title)
    return NextResponse.json({ error: "Title required" }, { status: 400 });

  const groups = await getStudyGroups();
  const group = groups[params.groupId];
  if (!group)
    return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const post: StudyPost = {
    id: generateId(),
    authorId: authorId || (session.user?.id as string),
    authorName: session.user?.name || "User",
    title,
    content: content || "",
    comments: [],
    timestamp: Date.now(),
  };

  group.posts.push(post);
  await saveStudyGroup(group);

  return NextResponse.json(post, { status: 201 });
}
