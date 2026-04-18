"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { SimpleWorkspace } from "@/lib/simpleStorage";

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  currentWorkspace: SimpleWorkspace | null;
  workspaces: SimpleWorkspace[];
  onCreateWorkspace: (name: string) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "chats", label: "Chats", icon: "💬" },
  { id: "minigames", label: "Minigames", icon: "🎮" },
  { id: "study", label: "Group Study", icon: "📚" },
  { id: "productivity", label: "Productivity", icon: "🌅" },
];

export default function Sidebar({
  activeNav,
  setActiveNav,
  currentWorkspace,
  workspaces,
  onCreateWorkspace,
}: SidebarProps) {
  const { data: session } = useSession();
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleWorkspaceSelect = (workspace: SimpleWorkspace) => {
    console.log("Selecting workspace:", workspace.id, workspace.name);
    // Dispatch custom event with the full workspace object
    window.dispatchEvent(
      new CustomEvent("workspaceChange", { detail: workspace }),
    );
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>LOOKOUT</h1>
        {session?.user && (
          <div style={{ marginTop: "12px", fontSize: "0.85rem", opacity: 0.8 }}>
            👤 {session.user.name}
          </div>
        )}
      </div>

      <div className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
            onClick={() => setActiveNav(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "20px", borderTop: "1px solid #0f3460" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>WORKSPACES</span>
          <button
            onClick={() => setShowWorkspaceModal(true)}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            +
          </button>
        </div>
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => handleWorkspaceSelect(ws)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "4px",
              cursor: "pointer",
              background:
                currentWorkspace?.id === ws.id ? "#0f3460" : "transparent",
            }}
          >
            # {ws.name}
          </div>
        ))}
        {workspaces.length === 0 && (
          <div
            style={{
              fontSize: "0.8rem",
              opacity: 0.5,
              textAlign: "center",
              marginTop: "12px",
            }}
          >
            No workspaces yet
            <br />
            Click + to create one
          </div>
        )}
      </div>

      <div style={{ padding: "20px", marginTop: "auto" }}>
        <button
          onClick={() => signOut()}
          style={{
            width: "100%",
            padding: "10px",
            background: "#e53e3e",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>

      {showWorkspaceModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowWorkspaceModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Workspace</h3>
            <input
              type="text"
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                newWorkspaceName.trim() &&
                onCreateWorkspace(newWorkspaceName)
              }
            />
            <div className="modal-buttons">
              <button
                onClick={() => {
                  if (newWorkspaceName.trim()) {
                    onCreateWorkspace(newWorkspaceName);
                    setShowWorkspaceModal(false);
                    setNewWorkspaceName("");
                  }
                }}
              >
                Create
              </button>
              <button onClick={() => setShowWorkspaceModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
