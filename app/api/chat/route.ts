export const config = {
  runtime: "edge",
};

let connections: WebSocket[] = [];

// In-memory history (Vercel Edge allows this — persists per region)
let history: any[] = [];

export default function handler(req: Request) {
  // Upgrade to WebSocket
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const [client, server] = Object.values(new WebSocketPair());

  server.accept();

  // Send existing history to the new client
  server.send(JSON.stringify({ type: "history", data: history }));

  // Add to connection list
  connections.push(server);

  server.addEventListener("message", (event) => {
    try {
      const msg = JSON.parse(event.data);

      // Save to history
      history.push(msg);

      // Broadcast to all clients
      for (const ws of connections) {
        try {
          ws.send(JSON.stringify({ type: "message", data: msg }));
        } catch {
          // Remove dead sockets
        }
      }
    } catch (err) {
      console.error("Invalid message", err);
    }
  });

  server.addEventListener("close", () => {
    connections = connections.filter((ws) => ws !== server);
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
