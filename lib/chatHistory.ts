import fs from "fs/promises";
import path from "path";
import { MongoClient } from "mongodb";

const HISTORY_FILE = path.join(process.cwd(), "history.json");
const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH || "10000", 10);
const MAX_HISTORY_SIZE = parseInt(process.env.MAX_HISTORY_SIZE || "10000000", 10);

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "lookout";
const MONGODB_COLLECTION = "chatMessages";

let cachedClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

async function getMongoCollection() {
  const client = await getMongoClient();
  return client.db(MONGODB_DB).collection<ChatMessage>(MONGODB_COLLECTION);
}

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
}

function validateMessage(message: ChatMessage): boolean {
  if (!message.sender || typeof message.sender !== "string") return false;
  if (!message.text || typeof message.text !== "string") return false;
  if (typeof message.timestamp !== "number") return false;
  if (message.text.length > MAX_MESSAGE_LENGTH) return false;
  if (message.sender.length > 256) return false;
  return true;
}

export async function getHistory(): Promise<ChatMessage[]> {
  if (MONGODB_URI) {
    try {
      const collection = await getMongoCollection();
      const docs = await collection
        .find({})
        .sort({ timestamp: 1 })
        .toArray();
      return docs.filter(validateMessage);
    } catch (err) {
      console.error("MongoDB history read failed:", err);
      return [];
    }
  }

  try {
    const data = await fs.readFile(HISTORY_FILE, "utf-8");
    const parsed = JSON.parse(data);

    // Validate data is an array
    if (!Array.isArray(parsed)) {
      console.warn("History file corrupted, resetting");
      return [];
    }

    // Filter out invalid messages
    return parsed.filter(validateMessage);
  } catch (err) {
    // File doesn't exist or is invalid JSON
    return [];
  }
}

export async function saveMessage(message: ChatMessage): Promise<void> {
  // Validate message before saving
  if (!validateMessage(message)) {
    throw new Error("Invalid message format");
  }

  if (MONGODB_URI) {
    const collection = await getMongoCollection();
    await collection.insertOne(message);
    return;
  }

  const history = await getHistory();
  
  // Prevent unbounded growth
  if (history.length > 10000) {
    history.shift(); // Remove oldest message
  }
  
  history.push(message);
  
  const jsonString = JSON.stringify(history, null, 2);
  
  // Prevent files from growing too large
  if (jsonString.length > MAX_HISTORY_SIZE) {
    throw new Error("Chat history file too large");
  }

  try {
    await fs.writeFile(HISTORY_FILE, jsonString);
  } catch (err) {
    const writeError = err as NodeJS.ErrnoException;
    if (writeError?.code === "EACCES" || writeError?.code === "EPERM") {
      throw new Error(
        "Server storage unavailable: this deployment does not support local file writes"
      );
    }
    throw err;
  }
}

export async function clearHistory(): Promise<void> {
  if (MONGODB_URI) {
    const collection = await getMongoCollection();
    await collection.deleteMany({});
    return;
  }

  try {
    await fs.writeFile(HISTORY_FILE, JSON.stringify([], null, 2));
  } catch (err) {
    const writeError = err as NodeJS.ErrnoException;
    if (writeError?.code === "EACCES" || writeError?.code === "EPERM") {
      throw new Error(
        "Server storage unavailable: this deployment does not support local file writes"
      );
    }
    throw err;
  }
}

export async function saveHistory(history: ChatMessage[]): Promise<void> {
  // Validate all messages
  if (!Array.isArray(history) || !history.every(validateMessage)) {
    throw new Error("Invalid history data");
  }
  
  const jsonString = JSON.stringify(history, null, 2);
  
  if (jsonString.length > MAX_HISTORY_SIZE) {
    throw new Error("Chat history file too large");
  }

  if (MONGODB_URI) {
    const collection = await getMongoCollection();
    await collection.deleteMany({});
    if (history.length > 0) {
      await collection.insertMany(history);
    }
    return;
  }

  try {
    await fs.writeFile(HISTORY_FILE, jsonString);
  } catch (err) {
    const writeError = err as NodeJS.ErrnoException;
    if (writeError?.code === "EACCES" || writeError?.code === "EPERM") {
      throw new Error(
        "Server storage unavailable: this deployment does not support local file writes"
      );
    }
    throw err;
  }
}

