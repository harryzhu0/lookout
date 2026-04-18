import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

async function getStudyGroups() {
  try {
    const data = await fs.readFile(
      path.join(DATA_DIR, "study_groups.json"),
      "utf-8",
    );
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveStudyGroups(groups: any) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, "study_groups.json"),
    JSON.stringify(groups, null, 2),
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, groupId, authorId } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId is required" },
        { status: 400 },
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Post title required" },
        { status: 400 },
      );
    }

    const groups = await getStudyGroups();
    const group = groups[groupId];

    if (!group) {
      return NextResponse.json(
        { error: "Study group not found" },
        { status: 404 },
      );
    }

    const postId = crypto.randomBytes(16).toString("hex");
    const post = {
      id: postId,
      title: title.trim(),
      content: content || "",
      authorId: authorId || session.user?.id,
      authorName: session.user?.name || "User",
      comments: [],
      timestamp: Date.now(),
    };

    group.posts.push(post);
    await saveStudyGroups(groups);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
