"use client";

import { useState } from "react";
import { SimpleWorkspace } from "@/lib/simpleStorage";
import HomeView from "./views/HomeView";
import ChatsView from "./views/ChatsView";
import MinigamesView from "./views/MinigamesView";
import StudyView from "./views/StudyView";
import ProductivityView from "./views/ProductivityView";
import MemberManagement from "./MemberManagement";

interface WorkspaceViewProps {
  activeNav: string;
  currentWorkspace: SimpleWorkspace | null;
  userId: string;
}

export default function WorkspaceView({
  activeNav,
  currentWorkspace,
  userId,
}: WorkspaceViewProps) {
  const [showMembers, setShowMembers] = useState(false);

  console.log("WorkspaceView - currentWorkspace:", currentWorkspace);
  console.log("WorkspaceView - workspace ID:", currentWorkspace?.id);

  if (!currentWorkspace) {
    return (
      <div className="main-content">
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p>No workspace selected</p>
            <p style={{ opacity: 0.7, fontSize: "0.9rem", marginTop: "8px" }}>
              Create a workspace from the sidebar to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = currentWorkspace.ownerId === userId;

  if (showMembers) {
    console.log("Showing members for workspace:", currentWorkspace.id);
    return (
      <div className="main-content">
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div className="workspace-header">
            <div className="workspace-selector">
              <button
                onClick={() => setShowMembers(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ← Back
              </button>
              <span style={{ marginLeft: "10px" }}>
                Members - {currentWorkspace.name}
              </span>
            </div>
          </div>
          <MemberManagement
            workspaceId={currentWorkspace.id}
            currentUserId={userId}
            isOwner={isOwner}
          />
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeNav) {
      case "home":
        return <HomeView userId={userId} workspaceId={currentWorkspace.id} />;
      case "chats":
        return <ChatsView workspaceId={currentWorkspace.id} userId={userId} />;
      case "minigames":
        return <MinigamesView />;
      case "study":
        return <StudyView workspaceId={currentWorkspace.id} userId={userId} />;
      case "productivity":
        return <ProductivityView />;
      default:
        return <HomeView userId={userId} workspaceId={currentWorkspace.id} />;
    }
  };

  return (
    <div className="main-content">
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="workspace-header">
          <div className="workspace-selector">
            <span>{currentWorkspace.name}</span>
          </div>
          <button
            onClick={() => setShowMembers(true)}
            style={{
              padding: "6px 12px",
              background: "#667eea",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            👥 Members ({currentWorkspace.members.length})
          </button>
        </div>
        {renderView()}
      </div>
    </div>
  );
}
