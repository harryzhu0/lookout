"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          padding: "48px",
          borderRadius: "24px",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>LOOKOUT</h1>
        <p style={{ marginBottom: "32px", opacity: 0.9 }}>
          Connect, study, and play with your team
        </p>
        <button
          onClick={() => signIn("github")}
          style={{
            padding: "14px 32px",
            fontSize: "16px",
            backgroundColor: "#fff",
            color: "#333",
            border: "none",
            borderRadius: "40px",
            cursor: "pointer",
            fontWeight: "bold",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>🔑</span>
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
