"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/debug")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Debug Info</h1>
      <pre
        style={{
          background: "#1a1a2e",
          padding: 20,
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
