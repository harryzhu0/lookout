"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import useChat, { ChatMessage } from "../hooks/chat";

export default function Page() {
  const { data: session } = useSession();
  const { messages, sendMessage, isLoading, error } = useChat();
  const [input, setInput] = useState("");

  // Show login page if not authenticated
  if (!session) {
    return (
      <div style={{ 
        padding: 20, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        minHeight: "100vh"
      }}>
        <h1>LOOKOUT Chat</h1>
        <p>Sign in with GitHub to continue</p>
        <button 
          onClick={() => signIn("github")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  // Chat screen
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>LOOKOUT Chat</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Welcome, {session.user?.name || session.user?.email}</span>
          <button 
            onClick={() => signOut()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e82e04",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && <div style={{ color: "red", marginBottom: 10 }}>Error: {error}</div>}

      <div
        style={{
          marginBottom: 20,
          height: "60vh",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 6,
          backgroundColor: "#f9f9f9"
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999" }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((m: ChatMessage, i: number) => {
            const time = new Date(m.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #eee" }}>
                <strong>{m.sender}</strong>{" "}
                <span style={{ opacity: 0.6, fontSize: "0.85em" }}>({time})</span>
                <div style={{ marginTop: 4 }}>{m.text}</div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && input.trim() && !isLoading) {
              sendMessage(input);
              setInput("");
            }
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: 4,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? "not-allowed" : "text"
          }}
          disabled={isLoading}
        />

        <button
          onClick={() => {
            if (input.trim() && !isLoading) {
              sendMessage(input);
              setInput("");
            }
          }}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: isLoading ? "#ccc" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
