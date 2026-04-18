"use client";

import { useState, useEffect, useRef } from "react";

interface SimpleChannel {
  id: string;
  workspaceId: string;
  name: string;
  type: "public" | "private";
  messages: any[];
  createdAt: number;
}

interface SimpleMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface ChatsViewProps {
  workspaceId: string;
  userId: string;
}

export default function ChatsView({ workspaceId, userId }: ChatsViewProps) {
  const [channels, setChannels] = useState<SimpleChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<SimpleChannel | null>(
    null,
  );
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [input, setInput] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<"public" | "private">(
    "public",
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when channel changes
  useEffect(() => {
    if (activeChannel) {
      inputRef.current?.focus();
    }
  }, [activeChannel]);

  // Load channels
  useEffect(() => {
    if (workspaceId) {
      fetch(`/api/channels?workspaceId=${workspaceId}`)
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
        // Keep focus on input after sending
        inputRef.current?.focus();
      } else {
        const error = await res.json();
        console.error("Failed to send message:", error);
        alert("Failed to send message: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Network error while sending message");
    } finally {
      setIsLoading(false);
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newChannelName,
          type: newChannelType,
          workspaceId: workspaceId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChannels((prev) => [...prev, data]);
        setShowCreateChannel(false);
        setNewChannelName("");
      } else {
        const error = await response.json();
        console.error("Failed to create channel:", error);
        alert(`Failed to create channel: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Network error while creating channel");
    } finally {
      setIsLoading(false);
    }
  };

  // Group messages by sender for compact display
  const getGroupedMessages = () => {
    const grouped: Array<{
      messages: SimpleMessage[];
      senderName: string;
      senderId: string;
    }> = [];

    for (let i = 0; i < messages.length; i++) {
      const current = messages[i];
      const previous = messages[i - 1];

      // Check if this message is from the same sender as previous
      if (previous && previous.senderId === current.senderId) {
        // Add to existing group
        grouped[grouped.length - 1].messages.push(current);
      } else {
        // Start new group
        grouped.push({
          messages: [current],
          senderName: current.senderName,
          senderId: current.senderId,
        });
      }
    }

    return grouped;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
                getGroupedMessages().map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="message-group"
                    style={{ marginBottom: "16px" }}
                  >
                    {/* Show avatar and name only for the first message in group */}
                    <div
                      className="message"
                      style={{ display: "flex", gap: "12px" }}
                    >
                      <div
                        className="message-avatar"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#667eea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        {group.senderName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          className="message-header"
                          style={{ marginBottom: "4px" }}
                        >
                          <span
                            className="message-sender"
                            style={{ fontWeight: "bold", color: "#667eea" }}
                          >
                            {group.senderName}
                          </span>
                          <span
                            style={{
                              marginLeft: "10px",
                              fontSize: "0.75rem",
                              opacity: 0.6,
                            }}
                          >
                            {new Date(
                              group.messages[0].timestamp,
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                        {group.messages.map((msg, idx) => (
                          <div
                            key={msg.id || idx}
                            className="message-text"
                            style={{ marginTop: idx > 0 ? "4px" : 0 }}
                          >
                            {msg.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-area">
              <input
                ref={inputRef}
                className="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
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
