"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import WorkspaceView from "./WorkspaceView";
import { Workspace } from "@/types";

export default function MainApp() {
  const { data: session } = useSession();
  const [activeNav, setActiveNav] = useState("home");
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null,
  );
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    // Load user's workspaces
    fetch("/api/workspaces")
      .then((res) => res.json())
      .then((data) => {
        setWorkspaces(data.workspaces);
        if (data.workspaces.length > 0 && !currentWorkspace) {
          setCurrentWorkspace(data.workspaces[0]);
        }
      });
  }, []);

  const handleCreateWorkspace = async (name: string) => {
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setWorkspaces([...workspaces, data.workspace]);
    setCurrentWorkspace(data.workspace);
  };

  return (
    <div className="app-container">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onCreateWorkspace={handleCreateWorkspace}
      />
      <WorkspaceView
        activeNav={activeNav}
        currentWorkspace={currentWorkspace}
        userId={session?.user?.id || ""}
      />
    </div>
  );
}
