"use client";

import { useState, useEffect, useRef } from "react";
import { Channel, ChatMessage } from "@/types";
import { useSession } from "next-auth/react";

interface ChatsViewProps {
  workspaceId: string;
  userId: string;
}

export default function ChatsView({ workspaceId, userId }: ChatsViewProps) {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<"public" | "private">(
    "public",
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load channels
  useEffect(() => {
    if (workspaceId) {
      fetch(`/api/workspaces/${workspaceId}/channels`)
        .then((res) => res.json())
        .then((data) => {
          setChannels(data.channels || []);
        })
        .catch(console.error);
    }
  }, [workspaceId]);

  // Load messages when channel changes
  useEffect(() => {
    if (activeChannel) {
      fetch(`/api/channels/${activeChannel.id}/messages`)
        .then((res) => res.json())
        .then((data) => {
          setMessages(data.messages || []);
        })
        .catch(console.error);
    }
  }, [activeChannel]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChannel || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/channels/${activeChannel.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          senderId: userId,
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
        setInput("");
      } else {
        const error = await res.json();
        console.error("Failed to send message:", error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChannelName,
          type: newChannelType,
          creatorId: userId,
        }),
      });

      if (res.ok) {
        const newChannel = await res.json();
        setChannels((prev) => [...prev, newChannel]);
        setShowCreateChannel(false);
        setNewChannelName("");
      } else {
        const error = await res.json();
        console.error("Failed to create channel:", error);
      }
    } catch (error) {
      console.error("Error creating channel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Channel Sidebar */}
      <div className="channel-sidebar">
        <div className="channel-header">
          <span>Channels</span>
          <button
            className="add-channel-btn"
            onClick={() => setShowCreateChannel(true)}
          >
            +
          </button>
        </div>
        <div className="channels-list">
          {channels.length === 0 ? (
            <div style={{ textAlign: "center", opacity: 0.6, padding: "20px" }}>
              No channels yet
              <br />
              Click + to create one
            </div>
          ) : (
            channels.map((channel) => (
              <div
                key={channel.id}
                className={`channel-item ${activeChannel?.id === channel.id ? "active" : ""}`}
                onClick={() => setActiveChannel(channel)}
              >
                <div className="channel-name">
                  <span>#</span> {channel.name}
                  {channel.type === "private" && (
                    <span className="channel-private">🔒</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {activeChannel ? (
          <>
            <div className="workspace-header">
              <div className="workspace-selector">
                <span># {activeChannel.name}</span>
              </div>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div
                  style={{ textAlign: "center", opacity: 0.6, padding: "40px" }}
                >
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.id || idx} className="message">
                    <div className="message-avatar">
                      {msg.senderName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">{msg.senderName}</span>
                        <span className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="message-text">{msg.text}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-area">
              <input
                className="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Message #${activeChannel.name}`}
                disabled={isLoading}
              />
              <button
                className="send-button"
                onClick={sendMessage}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <p>Select a channel to start chatting</p>
            {channels.length === 0 && (
              <button
                onClick={() => setShowCreateChannel(true)}
                style={{
                  padding: "10px 20px",
                  background: "#667eea",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Create your first channel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateChannel(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Channel</h3>
            <input
              type="text"
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && createChannel()}
              autoFocus
            />
            <select
              value={newChannelType}
              onChange={(e) =>
                setNewChannelType(e.target.value as "public" | "private")
              }
            >
              <option value="public">Public - Everyone can join</option>
              <option value="private">Private - Invite only</option>
            </select>
            <div className="modal-buttons">
              <button onClick={createChannel} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
              </button>
              <button onClick={() => setShowCreateChannel(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
