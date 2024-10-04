import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import configure from "./routers";

const app = express();
const port = process.env.PORT || 3000;

const isDebugging = true;

if (!isDebugging) {
    console.log = () => {};
}

function onSocketPreError(e: Error) {
    console.log(e);
}

function onSocketPostError(e: Error) {
    console.log(e);
}

configure(app);
console.log(`Attempting to run server on port ${port}`);

const s = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

const wss = new WebSocketServer({ noServer: true });

s.on("upgrade", (req, socket, head) => {
    socket.on("error", onSocketPreError);

    // perform auth here
    wss.handleUpgrade(req, socket, head, (ws) => {
        socket.removeListener("error", onSocketPreError);
        wss.emit("connection", ws, req);
    });
});

wss.on("connection", (ws, req) => {
    ws.on("error", onSocketPostError);

    broadcast(`Hi! ${wss.clients.size} client(s) connected.`);

    ws.on("message", msg => {
        broadcast(msg.toString());
    });

    ws.on("close", () => {
        console.log("Connection closed");
    });
});

function broadcast(message: string): void {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message, { binary: false });
        }
    });
}