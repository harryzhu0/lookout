"use client";

import { useState, useEffect } from "react";

interface StudyGroup {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  createdBy: string;
  creatorName: string;
  members: string[];
  posts: StudyPost[];
  createdAt: number;
}

interface StudyPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  comments: StudyComment[];
  timestamp: number;
}

interface StudyComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: number;
}

interface StudyViewProps {
  workspaceId: string;
  userId: string;
}

export default function StudyView({ workspaceId, userId }: StudyViewProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [selectedPost, setSelectedPost] = useState<StudyPost | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load study groups
  useEffect(() => {
    if (workspaceId) {
      fetch(`/api/study-groups?workspaceId=${workspaceId}`)
        .then((res) => res.json())
        .then((data) => setGroups(data.groups || []))
        .catch(console.error);
    }
  }, [workspaceId]);

  const createGroup = async () => {
    if (!newGroupName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
          workspaceId: workspaceId,
          creatorId: userId,
        }),
      });

      if (res.ok) {
        const group = await res.json();
        setGroups([...groups, group]);
        setShowCreateGroup(false);
        setNewGroupName("");
        setNewGroupDesc("");
      } else {
        const error = await res.json();
        alert("Failed to create group: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Network error while creating group");
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    if (!postTitle.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/study-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          groupId: selectedGroup?.id,
          authorId: userId,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        const updatedGroup = {
          ...selectedGroup!,
          posts: [...selectedGroup!.posts, post],
        };
        setSelectedGroup(updatedGroup);
        setGroups(
          groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
        );
        setShowCreatePost(false);
        setPostTitle("");
        setPostContent("");
      } else {
        const error = await res.json();
        alert("Failed to create post: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Network error while creating post");
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/study-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText,
          groupId: selectedGroup?.id,
          postId: selectedPost?.id,
          authorId: userId,
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        const updatedPost = {
          ...selectedPost!,
          comments: [...selectedPost!.comments, comment],
        };
        setSelectedPost(updatedPost);

        const updatedGroup = {
          ...selectedGroup!,
          posts: selectedGroup!.posts.map((p) =>
            p.id === updatedPost.id ? updatedPost : p,
          ),
        };
        setSelectedGroup(updatedGroup);
        setCommentText("");
      } else {
        const error = await res.json();
        alert("Failed to add comment: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Network error while adding comment");
    } finally {
      setIsLoading(false);
    }
  };

  // Post detail view
  if (selectedPost && selectedGroup) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <button
          onClick={() => setSelectedPost(null)}
          style={{
            marginBottom: 20,
            padding: "8px 16px",
            background: "#667eea",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          ← Back to Posts
        </button>

        <div
          style={{
            background: "#0f3460",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: 20,
          }}
        >
          <h2 style={{ marginBottom: 12 }}>{selectedPost.title}</h2>
          <div style={{ opacity: 0.7, fontSize: "0.85rem", marginBottom: 16 }}>
            By {selectedPost.authorName} •{" "}
            {new Date(selectedPost.timestamp).toLocaleString()}
          </div>
          <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {selectedPost.content}
          </p>
        </div>

        <h3 style={{ marginBottom: 16 }}>
          Comments ({selectedPost.comments.length})
        </h3>
        {selectedPost.comments.length === 0 ? (
          <div style={{ textAlign: "center", opacity: 0.6, padding: "20px" }}>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          selectedPost.comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: "#1a1a2e",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: 12,
              }}
            >
              <strong>{comment.authorName}</strong>{" "}
              <span style={{ opacity: 0.6, fontSize: "0.75rem" }}>
                {new Date(comment.timestamp).toLocaleString()}
              </span>
              <p style={{ marginTop: 8 }}>{comment.content}</p>
            </div>
          ))
        )}

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addComment()}
            placeholder="Add a comment..."
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
            onClick={addComment}
            style={{
              padding: "10px 20px",
              background: "#667eea",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Comment
          </button>
        </div>
      </div>
    );
  }

  // Group detail view (posts list)
  if (selectedGroup) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => setSelectedGroup(null)}
            style={{
              padding: "8px 16px",
              background: "#667eea",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
            }}
          >
            ← Back to Groups
          </button>
          <button
            onClick={() => setShowCreatePost(true)}
            style={{
              padding: "8px 16px",
              background: "#4caf50",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
            }}
          >
            + New Post
          </button>
        </div>

        <h2 style={{ marginBottom: 8 }}>{selectedGroup.name}</h2>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          {selectedGroup.description}
        </p>

        <h3 style={{ marginBottom: 16 }}>
          Posts ({selectedGroup.posts.length})
        </h3>
        {selectedGroup.posts.length === 0 ? (
          <div style={{ textAlign: "center", opacity: 0.6, padding: "40px" }}>
            No posts yet. Be the first to create one!
          </div>
        ) : (
          selectedGroup.posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              style={{
                background: "#0f3460",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: 12,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1a1a2e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#0f3460")
              }
            >
              <h4 style={{ marginBottom: 8 }}>{post.title}</h4>
              <p style={{ opacity: 0.7, fontSize: "0.85rem", marginBottom: 8 }}>
                {post.content.substring(0, 150)}...
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: "0.8rem",
                  opacity: 0.5,
                }}
              >
                <span>💬 {post.comments.length} comments</span>
                <span>👤 By {post.authorName}</span>
                <span>📅 {new Date(post.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}

        {showCreatePost && (
          <div
            className="modal-overlay"
            onClick={() => setShowCreatePost(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Create Post</h3>
              <input
                type="text"
                placeholder="Title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
              <textarea
                placeholder="Content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={5}
              />
              <div className="modal-buttons">
                <button onClick={createPost}>Post</button>
                <button onClick={() => setShowCreatePost(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main study groups list view
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>📚 Group Study</h2>
        <button
          onClick={() => setShowCreateGroup(true)}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          + New Study Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div style={{ textAlign: "center", opacity: 0.6, padding: "60px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📚</div>
          <p>No study groups yet. Create one to get started!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              style={{
                background: "#0f3460",
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateX(4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateX(0)")
              }
            >
              <h3 style={{ marginBottom: 8 }}>{group.name}</h3>
              <p style={{ opacity: 0.7, marginBottom: 12 }}>
                {group.description}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: "0.85rem",
                  opacity: 0.6,
                }}
              >
                <span>📝 {group.posts.length} posts</span>
                <span>👥 {group.members.length} members</span>
                <span>👤 Created by {group.creatorName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateGroup && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateGroup(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Study Group</h3>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              rows={3}
            />
            <div className="modal-buttons">
              <button onClick={createGroup}>Create</button>
              <button onClick={() => setShowCreateGroup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
