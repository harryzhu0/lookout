import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  Workspace,
  Channel,
  ChatMessage,
  DirectMessage,
  StudyGroup,
  User,
  StudyPost,
  StudyComment,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic read/write functions
async function readJSON<T>(filename: string): Promise<T> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(data);
  } catch {
    return {} as T;
  }
}

async function writeJSON<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
  );
}

// Workspace operations
export async function getWorkspaces(): Promise<Record<string, Workspace>> {
  return readJSON<Record<string, Workspace>>("workspaces.json");
}

export async function saveWorkspace(workspace: Workspace): Promise<void> {
  const workspaces = await getWorkspaces();
  workspaces[workspace.id] = workspace;
  await writeJSON("workspaces.json", workspaces);
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  const workspaces = await getWorkspaces();
  return workspaces[id] || null;
}

// Channel operations
export async function getChannels(): Promise<Record<string, Channel>> {
  return readJSON<Record<string, Channel>>("channels.json");
}

export async function saveChannel(channel: Channel): Promise<void> {
  const channels = await getChannels();
  channels[channel.id] = channel;
  await writeJSON("channels.json", channels);

  // Also add channel to workspace
  const workspace = await getWorkspace(channel.workspaceId);
  if (workspace && !workspace.channels.includes(channel.id)) {
    workspace.channels.push(channel.id);
    await saveWorkspace(workspace);
  }
}

export async function getWorkspaceChannels(
  workspaceId: string,
): Promise<Channel[]> {
  const channels = await getChannels();
  return Object.values(channels).filter((c) => c.workspaceId === workspaceId);
}

// Message operations
export async function getMessages(channelId: string): Promise<ChatMessage[]> {
  const messages =
    await readJSON<Record<string, ChatMessage[]>>("messages.json");
  return messages[channelId] || [];
}

export async function saveMessage(message: ChatMessage): Promise<void> {
  const messages =
    await readJSON<Record<string, ChatMessage[]>>("messages.json");
  if (!messages[message.channelId]) {
    messages[message.channelId] = [];
  }
  messages[message.channelId].push(message);
  await writeJSON("messages.json", messages);
}

export async function getDirectMessages(
  userId1: string,
  userId2: string,
): Promise<DirectMessage | null> {
  const dms = await readJSON<Record<string, DirectMessage>>(
    "direct_messages.json",
  );
  const key = [userId1, userId2].sort().join(":");
  return dms[key] || null;
}

export async function saveDirectMessage(dm: DirectMessage): Promise<void> {
  const dms = await readJSON<Record<string, DirectMessage>>(
    "direct_messages.json",
  );
  const key = dm.participants.sort().join(":");
  dms[key] = dm;
  await writeJSON("direct_messages.json", dms);
}

// Study group operations
export async function getStudyGroups(): Promise<Record<string, StudyGroup>> {
  return readJSON<Record<string, StudyGroup>>("study_groups.json");
}

export async function saveStudyGroup(group: StudyGroup): Promise<void> {
  const groups = await getStudyGroups();
  groups[group.id] = group;
  await writeJSON("study_groups.json", groups);
}

export async function addStudyPost(
  workspaceId: string,
  groupId: string,
  post: StudyPost,
): Promise<void> {
  const groups = await getStudyGroups();
  const group = groups[groupId];
  if (group && group.workspaceId === workspaceId) {
    group.posts.push(post);
    await writeJSON("study_groups.json", groups);
  }
}

export async function addStudyComment(
  workspaceId: string,
  groupId: string,
  postId: string,
  comment: StudyComment,
): Promise<void> {
  const groups = await getStudyGroups();
  const group = groups[groupId];
  if (group && group.workspaceId === workspaceId) {
    const post = group.posts.find((p) => p.id === postId);
    if (post) {
      post.comments.push(comment);
      await writeJSON("study_groups.json", groups);
    }
  }
}

// User presence
export async function updateUserStatus(
  uid: string,
  status: User["status"],
): Promise<void> {
  const users = await readJSON<Record<string, User>>("users_status.json");
  if (!users[uid]) users[uid] = {} as User;
  users[uid].status = status;
  users[uid].lastSeen = Date.now();
  await writeJSON("users_status.json", users);
}

// Helper to generate IDs
export function generateId(): string {
  return crypto.randomBytes(16).toString("hex");
}
