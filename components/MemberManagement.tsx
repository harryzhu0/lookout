"use client";

import { useState, useEffect } from "react";

interface Member {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: "admin" | "member";
  joinedAt: number;
}

interface MemberManagementProps {
  workspaceId: string;
  currentUserId: string;
  isOwner: boolean;
}

export default function MemberManagement({
  workspaceId,
  currentUserId,
  isOwner,
}: MemberManagementProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [roleToAdd, setRoleToAdd] = useState<"admin" | "member">("member");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  console.log("MemberManagement - workspaceId:", workspaceId);

  useEffect(() => {
    if (workspaceId) {
      loadMembers();
      loadInviteCode();
    }
  }, [workspaceId]);

  const loadMembers = async () => {
    try {
      console.log("Loading members for workspace:", workspaceId);
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (res.ok) {
        const data = await res.json();
        console.log("Members loaded:", data);
        // Ensure members is an array
        setMembers(Array.isArray(data.members) ? data.members : []);
      } else {
        const error = await res.json();
        console.error("Failed to load members:", error);
        setError("Failed to load members: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error loading members:", error);
      setError("Network error while loading members");
    }
  };

  const loadInviteCode = async () => {
    try {
      console.log("Loading invite code for workspace:", workspaceId);
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`);
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode || "");
      } else {
        const error = await res.json();
        console.error("Failed to load invite code:", error);
      }
    } catch (error) {
      console.error("Error loading invite code:", error);
    }
  };

  const generateInviteCode = async () => {
    setIsLoading(true);
    setError("");
    try {
      console.log("Generating invite code for workspace:", workspaceId);
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
        alert("New invite code generated!");
      } else {
        const error = await res.json();
        setError(
          "Failed to generate invite code: " + (error.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error generating invite code:", error);
      setError("Network error while generating invite code");
    } finally {
      setIsLoading(false);
    }
  };

  const addMemberByEmail = async () => {
    if (!emailToAdd.trim()) return;

    setIsLoading(true);
    setError("");
    try {
      console.log(
        "Adding member to workspace:",
        workspaceId,
        "email:",
        emailToAdd,
      );
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToAdd, role: roleToAdd }),
      });

      const data = await res.json();
      console.log("Add member response:", data);

      if (res.ok) {
        setMembers([...members, data.member]);
        setShowAddMemberModal(false);
        setEmailToAdd("");
        alert(data.message);
      } else {
        setError("Failed to add member: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding member:", error);
      setError("Network error while adding member");
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${userName} from this workspace?`,
      )
    )
      return;

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setMembers(members.filter((m) => m.userId !== userId));
        alert("Member removed successfully");
      } else {
        const error = await res.json();
        setError(
          "Failed to remove member: " + (error.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error removing member:", error);
      setError("Network error while removing member");
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join?code=${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied to clipboard!");
  };

  // Get safe display name
  const getDisplayName = (member: Member) => {
    return member.userName || member.userEmail?.split("@")[0] || "User";
  };

  return (
    <div style={{ padding: "20px" }}>
      {error && (
        <div
          style={{
            background: "#e53e3e",
            color: "white",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3>Workspace Members ({members.length})</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowAddMemberModal(true)}
            style={{
              padding: "8px 16px",
              background: "#4caf50",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
            }}
          >
            + Add Member
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            style={{
              padding: "8px 16px",
              background: "#667eea",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
            }}
          >
            📋 Invite Link
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {members.length === 0 ? (
          <div style={{ textAlign: "center", opacity: 0.6, padding: "40px" }}>
            No members yet. Invite people to join!
          </div>
        ) : (
          members.map((member) => {
            const displayName = getDisplayName(member);
            const initial = displayName[0]?.toUpperCase() || "?";

            return (
              <div
                key={member.userId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: "#0f3460",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#667eea",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {initial}
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{displayName}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                      {member.userEmail || "No email"}
                    </div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                      {member.role === "admin" ? "👑 Admin" : "👤 Member"} •
                      Joined{" "}
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString()
                        : "Recently"}
                    </div>
                  </div>
                </div>
                {member.userId !== currentUserId &&
                  (isOwner || member.role !== "admin") && (
                    <button
                      onClick={() => removeMember(member.userId, displayName)}
                      style={{
                        padding: "6px 12px",
                        background: "#e53e3e",
                        border: "none",
                        borderRadius: "4px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Remove
                    </button>
                  )}
                {member.userId === currentUserId && (
                  <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>(You)</div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowInviteModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Invite People to Workspace</h3>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ marginBottom: "10px" }}>Share this invite link:</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={
                    inviteCode
                      ? `${window.location.origin}/join?code=${inviteCode}`
                      : "No invite code generated"
                  }
                  readOnly
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#0f3460",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                  }}
                />
                <button
                  onClick={copyInviteLink}
                  style={{
                    padding: "10px 20px",
                    background: "#667eea",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={generateInviteCode}
                disabled={isLoading}
                style={{
                  padding: "8px 16px",
                  background: "#4caf50",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Generate New Code
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  padding: "8px 16px",
                  background: "#666",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddMemberModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Member by Email</h3>
            <p
              style={{
                marginBottom: "10px",
                fontSize: "0.85rem",
                opacity: 0.7,
              }}
            >
              Enter the email address of the user you want to add. The user must
              have signed in to LOOKOUT at least once.
            </p>
            <input
              type="email"
              placeholder="user@example.com"
              value={emailToAdd}
              onChange={(e) => setEmailToAdd(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                background: "#0f3460",
                border: "none",
                borderRadius: "6px",
                color: "white",
              }}
            />
            <select
              value={roleToAdd}
              onChange={(e) =>
                setRoleToAdd(e.target.value as "admin" | "member")
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                background: "#0f3460",
                border: "none",
                borderRadius: "6px",
                color: "white",
              }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="modal-buttons">
              <button onClick={addMemberByEmail} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Member"}
              </button>
              <button onClick={() => setShowAddMemberModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
