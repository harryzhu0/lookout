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

    const groups = await getStudyGroups();
    const workspaceGroups = Object.values(groups).filter(
      (g: any) => g.workspaceId === workspaceId,
    );

    return NextResponse.json({ groups: workspaceGroups });
  } catch (error) {
    console.error("Error fetching study groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch study groups" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, workspaceId, creatorId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Group name required" },
        { status: 400 },
      );
    }

    const groups = await getStudyGroups();
    const groupId = crypto.randomBytes(16).toString("hex");

    const group = {
      id: groupId,
      workspaceId: workspaceId,
      name: name.trim(),
      description: description || "",
      createdBy: creatorId || session.user?.id,
      creatorName: session.user?.name || "User",
      members: [creatorId || session.user?.id],
      posts: [],
      createdAt: Date.now(),
    };

    groups[groupId] = group;
    await saveStudyGroups(groups);

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating study group:", error);
    return NextResponse.json(
      { error: "Failed to create study group" },
      { status: 500 },
    );
  }
}
