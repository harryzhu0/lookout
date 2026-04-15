import fs from "fs/promises";
import path from "path";

const HISTORY_FILE = path.join(process.cwd(), "history.json");
const MAX_MESSAGE_LENGTH = 10000; // Prevent DoS via huge messages
const MAX_HISTORY_SIZE = 10_000_000; // ~10MB max file size

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
  
  await fs.writeFile(HISTORY_FILE, jsonString);
}

export async function clearHistory(): Promise<void> {
  await fs.writeFile(HISTORY_FILE, JSON.stringify([], null, 2));
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
  
  await fs.writeFile(HISTORY_FILE, jsonString);
}

