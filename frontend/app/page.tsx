"use client";

import { useEffect, useState } from "react";
import chat, { ChatMessage } from "../hooks/chat";

export default function Page() {
    const { messages, sendMessage } = chat();

    const [username, setUsername] = useState<string | null>(null);
    const [usernameInput, setUsernameInput] = useState("");
    const [input, setInput] = useState("");

    // Load username once
    useEffect(() => {
        const saved = localStorage.getItem("username");
        if (saved) setUsername(saved);
    }, []);

    // Save username only when confirmed
    const confirmUsername = () => {
        if (usernameInput.trim()) {
            localStorage.setItem("username", usernameInput.trim());
            setUsername(usernameInput.trim());
        }
    };

    // Username screen
    if (!username) {
        return (
            <div style={{ padding: 20 }}>
                <h2>Enter your username</h2>

                <input
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Your name"
                />

                <button onClick={confirmUsername} style={{ marginLeft: 10 }}>
                    Continue
                </button>
            </div>
        );
    }

    // Chat screen
    return (
        <div style={{ padding: 20 }}>
            <h2>LOOKOUT Chat</h2>

            <div
                style={{
                    marginBottom: 20,
                    height: "60vh",
                    overflowY: "auto",
                    border: "1px solid #ccc",
                    padding: 10,
                    borderRadius: 6
                }}
            >
                {messages.map((m: ChatMessage, i: number) => {
                    const time = new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                    return (
                        <div key={i} style={{ marginBottom: 6 }}>
                            <strong>{m.sender}</strong>{" "}
                            <span style={{ opacity: 0.6 }}>({time})</span>:{" "}
                            {m.text}
                        </div>
                    );
                })}
            </div>

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                style={{ width: "70%" }}
            />

            <button
                onClick={() => {
                    if (input.trim()) {
                        sendMessage(username, input);
                        setInput("");
                    }
                }}
                style={{ marginLeft: 10 }}
            >
                Send
            </button>
        </div>
    );
}
