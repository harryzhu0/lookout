"use client";

import { Workspace } from "@/types";
import HomeView from "./views/HomeView";
import ChatsView from "./views/ChatsView";
import MinigamesView from "./views/MinigamesView";
import StudyView from "./views/StudyView";
import ProductivityView from "./views/ProductivityView";

interface WorkspaceViewProps {
  activeNav: string;
  currentWorkspace: Workspace | null;
  userId: string;
}

export default function WorkspaceView({
  activeNav,
  currentWorkspace,
  userId,
}: WorkspaceViewProps) {
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

  return <div className="main-content">{renderView()}</div>;
}
