"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import MainApp from "@/components/MainApp";
import LoginPage from "@/components/LoginPage";

export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading") {
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

  if (!session) {
    return <LoginPage />;
  }

  return <MainApp />;
}
