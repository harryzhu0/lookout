"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inviteCode = searchParams.get("code");

  useEffect(() => {
    if (status === "loading") return;

    if (!session && inviteCode) {
      // Store invite code and redirect to login
      sessionStorage.setItem("pendingInviteCode", inviteCode);
      router.push("/");
      return;
    }

    if (session && inviteCode) {
      joinWorkspace();
    }
  }, [session, status, inviteCode]);

  const joinWorkspace = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(
          `Successfully joined ${data.workspace.name}! Redirecting...`,
        );
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        const error = await res.json();
        setMessage(`Failed to join: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      setMessage("Network error while joining workspace");
    } finally {
      setIsLoading(false);
    }
  };

  if (!inviteCode) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>Invalid Invite Link</h1>
          <p>No invite code provided.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "#16213e",
          padding: "40px",
          borderRadius: "12px",
          maxWidth: "400px",
        }}
      >
        <h2>Joining Workspace...</h2>
        {message && <p style={{ marginTop: "20px" }}>{message}</p>}
        {isLoading && <p>Processing...</p>}
        {!session && !isLoading && <p>Please sign in to join the workspace.</p>}
      </div>
    </div>
  );
}
