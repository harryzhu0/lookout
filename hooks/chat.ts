"use client";

import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
    sender: string;
    text: string;
    timestamp: number;
};

export default function chat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        // const socket = new WebSocket("https://curly-space-tribble-5g7qrrxwxrw427wqg-8080.app.github.dev/")
        wsRef.current = socket;

        socket.onmessage = (event) => {
            const msg: ChatMessage = JSON.parse(event.data);
            setMessages((prev) => [...prev, msg]);
        };

        return () => socket.close();
    }, []);

    const sendMessage = (sender: string, text: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ sender, text }));
        }
    };

    return { messages, sendMessage };
}
