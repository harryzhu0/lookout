"use client";

import { useEffect, useState } from "react";
import chat, { ChatMessage } from "../hooks/chat";

export default function Page() {
    const { messages, sendMessage } = chat();

    const [username, setUsername] = useState("");
    const [input, setInput] = useState("");

    // Load username from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("username");
        if (saved) setUsername(saved);
    }, []);

    // Save username
    useEffect(() => {
        if (username) localStorage.setItem("username", username);
    }, [username]);

    if (!username) {
        return (
            <div style={{ padding: 20 }}>
                <h2>Enter your username</h2>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name"
                />
            </div>
        );
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>LOOKOUT Chat</h2>

            <div style={{ marginBottom: 20 }}>
                {messages.map((m: ChatMessage, i: number) => {
                    const time = new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                    return (
                        <div key={i}>
                            <strong>{m.sender}</strong> <span style={{ opacity: 0.6 }}>({time})</span>: {m.text}
                        </div>
                    );
                })}

            </div>

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
            />

            <button
                onClick={() => {
                    if (input.trim()) {
                        sendMessage(username, input);
                        setInput("");
                    }
                }}
            >
                Send
            </button>
        </div>
    );
}
