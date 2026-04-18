"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import WorkspaceView from "./WorkspaceView";
import { SimpleWorkspace } from "@/lib/simpleStorage";

export default function MainApp() {
  const { data: session } = useSession();
  const [activeNav, setActiveNav] = useState("home");
  const [currentWorkspace, setCurrentWorkspace] =
    useState<SimpleWorkspace | null>(null);
  const [workspaces, setWorkspaces] = useState<SimpleWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const data = await res.json();
          console.log("Loaded workspaces:", data.workspaces);
          setWorkspaces(data.workspaces || []);
          if (
            data.workspaces &&
            data.workspaces.length > 0 &&
            !currentWorkspace
          ) {
            setCurrentWorkspace(data.workspaces[0]);
            console.log(
              "Set current workspace to:",
              data.workspaces[0].id,
              data.workspaces[0].name,
            );
          }
        }
      } catch (error) {
        console.error("Error loading workspaces:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadWorkspaces();
    }
  }, [session]);

  // Listen for workspace changes from sidebar
  useEffect(() => {
    const handleWorkspaceChange = (event: CustomEvent<SimpleWorkspace>) => {
      console.log("Workspace changed to:", event.detail);
      setCurrentWorkspace(event.detail);
    };

    window.addEventListener(
      "workspaceChange",
      handleWorkspaceChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "workspaceChange",
        handleWorkspaceChange as EventListener,
      );
    };
  }, []);

  const handleCreateWorkspace = async (name: string) => {
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Created workspace:", data.workspace);
        setWorkspaces([...workspaces, data.workspace]);
        setCurrentWorkspace(data.workspace);
      } else {
        const error = await res.json();
        console.error("Failed to create workspace:", error);
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  console.log(
    "MainApp rendering with currentWorkspace:",
    currentWorkspace?.id,
    currentWorkspace?.name,
  );

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
