"use client";

import { useState } from "react";
import chat from "../hooks/chat";

export default function Home() {
    const { messages, sendMessage } = chat();
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (input.trim().length === 0) return;
        sendMessage(input);
        setInput("");
    };

    return (
        <div style={{ padding: 20, fontFamily: "sans-serif" }}>
            <h1>LOOKOUT Chat</h1>

            <div
                style={{
                    border: "1px solid #ccc",
                    height: 300,
                    overflowY: "auto",
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 6,
                }}
            >
                {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                        {m}
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 4,
                        border: "1px solid #aaa",
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        padding: "8px 16px",
                        borderRadius: 4,
                        background: "#0070f3",
                        color: "white",
                        border: "none",
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
