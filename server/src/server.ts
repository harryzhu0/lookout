import { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";

// Prior note - Don't try connecting here, it's a goddamn webserver
// You have to start this and the frontend separately, just have two
// terminals the project root (lookout) and in them, run the commands
// "cd server" or "cd frontend" (one in each)
// "npm run dev" which starts the server

const wss = new WebSocketServer({ port: 8080 });

// Path to messages.json
const filePath = path.join(process.cwd(), "messages.json");

// Load existing messages
let history: any[] = [];
try {
    const data = fs.readFileSync(filePath, "utf8");
    history = JSON.parse(data);
} catch {
    console.log("No history file found, starting fresh.");
}

// Save messages to file
function saveHistory() {
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
}

wss.on("connection", (ws) => {
    console.log("Client connected");

    // Send history to new client
    history.forEach((msg) => ws.send(JSON.stringify(msg)));

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        const message = {
            sender: data.sender,
            text: data.text,
            timestamp: Date.now(),
        };

        history.push(message);
        saveHistory();

        // Broadcast to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    });
});
