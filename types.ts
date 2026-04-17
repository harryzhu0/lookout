export interface User {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  status?: "online" | "away" | "busy" | "offline";
  lastSeen?: number;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  admins: string[];
  members: string[];
  channels: string[];
  createdAt: number;
  inviteCode?: string;
}

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  type: "public" | "private";
  admins: string[];
  members: string[];
  createdAt: number;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  workspaceId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  replyTo?: string;
  attachments?: string[];
}

export interface DirectMessage {
  id: string;
  participants: string[]; // Array of user UIDs
  messages: DirectMessageEntry[];
}

export interface DirectMessageEntry {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface StudyGroup {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  posts: StudyPost[];
  createdAt: number;
}

export interface StudyPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  attachments?: string[];
  comments: StudyComment[];
  timestamp: number;
}

export interface StudyComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: number;
}

export interface UserSession {
  user: User;
  currentWorkspace?: Workspace;
}
