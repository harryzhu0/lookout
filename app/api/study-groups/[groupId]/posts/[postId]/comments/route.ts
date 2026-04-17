import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getStudyGroups, saveStudyGroup, generateId } from "@/lib/storage";
import { StudyComment } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string; postId: string } },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, authorId } = await req.json();
  if (!content)
    return NextResponse.json({ error: "Content required" }, { status: 400 });

  const groups = await getStudyGroups();
  const group = groups[params.groupId];
  if (!group)
    return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const post = group.posts.find((p) => p.id === params.postId);
  if (!post)
    return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const comment: StudyComment = {
    id: generateId(),
    authorId: authorId || (session.user?.id as string),
    authorName: session.user?.name || "User",
    content,
    timestamp: Date.now(),
  };

  post.comments.push(comment);
  await saveStudyGroup(group);

  return NextResponse.json(comment, { status: 201 });
}
