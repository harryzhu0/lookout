import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

export interface SimpleWorkspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  channels: SimpleChannel[];
  createdAt: number;
  inviteCode?: string;
}

export interface WorkspaceMember {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: "admin" | "member";
  joinedAt: number;
}

export interface SimpleChannel {
  id: string;
  workspaceId: string;
  name: string;
  type: "public" | "private";
  messages: SimpleMessage[];
  createdAt: number;
}

export interface SimpleMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface SimpleStudyGroup {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  posts: SimplePost[];
}

export interface SimplePost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  comments: SimpleComment[];
  timestamp: number;
}

export interface SimpleComment {
  id: string;
  authorName: string;
  content: string;
  timestamp: number;
}

// Initialize data directory
async function init() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// Generic read/write
async function readJSON<T>(filename: string): Promise<T> {
  await init();
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(data);
  } catch {
    return {} as T;
  }
}

async function writeJSON<T>(filename: string, data: T): Promise<void> {
  await init();
  await fs.writeFile(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
  );
}

// User operations - store user info from GitHub
export async function saveUserFromSession(session: any): Promise<void> {
  const users = await readJSON<Record<string, any>>("users.json");
  const userId = session.user?.id;

  if (userId && !users[userId]) {
    users[userId] = {
      uid: userId,
      name: session.user?.name,
      email: session.user?.email,
      avatar: session.user?.image,
      createdAt: Date.now(),
    };
    await writeJSON("users.json", users);
  }
}

export async function getUserByEmail(email: string): Promise<any | null> {
  const users = await readJSON<Record<string, any>>("users.json");
  return Object.values(users).find((u: any) => u.email === email) || null;
}

export async function getUserById(uid: string): Promise<any | null> {
  const users = await readJSON<Record<string, any>>("users.json");
  return users[uid] || null;
}

export async function getAllUsers(): Promise<any[]> {
  const users = await readJSON<Record<string, any>>("users.json");
  return Object.values(users);
}

// Workspace operations
export async function getWorkspaces(): Promise<
  Record<string, SimpleWorkspace>
> {
  return readJSON<Record<string, SimpleWorkspace>>("workspaces.json");
}

export async function saveWorkspace(workspace: SimpleWorkspace): Promise<void> {
  const workspaces = await getWorkspaces();
  workspaces[workspace.id] = workspace;
  await writeJSON("workspaces.json", workspaces);
}

export async function getWorkspace(
  id: string,
): Promise<SimpleWorkspace | null> {
  const workspaces = await getWorkspaces();
  return workspaces[id] || null;
}

// Channel operations
export async function getChannels(): Promise<Record<string, SimpleChannel>> {
  return readJSON<Record<string, SimpleChannel>>("channels.json");
}

export async function saveChannel(channel: SimpleChannel): Promise<void> {
  const channels = await getChannels();
  channels[channel.id] = channel;
  await writeJSON("channels.json", channels);
}

// Message operations
export async function getMessages(channelId: string): Promise<SimpleMessage[]> {
  const messages =
    await readJSON<Record<string, SimpleMessage[]>>("messages.json");
  return messages[channelId] || [];
}

export async function saveMessage(message: SimpleMessage): Promise<void> {
  const messages =
    await readJSON<Record<string, SimpleMessage[]>>("messages.json");
  if (!messages[message.channelId]) {
    messages[message.channelId] = [];
  }
  messages[message.channelId].push(message);
  await writeJSON("messages.json", messages);
}

// Study group operations
export async function getStudyGroups(): Promise<
  Record<string, SimpleStudyGroup>
> {
  return readJSON<Record<string, SimpleStudyGroup>>("study_groups.json");
}

export async function saveStudyGroup(group: SimpleStudyGroup): Promise<void> {
  const groups = await getStudyGroups();
  groups[group.id] = group;
  await writeJSON("study_groups.json", groups);
}

export function generateId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generateInviteCode(): string {
  return crypto.randomBytes(8).toString("hex");
}
