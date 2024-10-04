import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { configure as configureRoutes } from "./routers";
import { dispose as disposeDatabase } from "./db";

const app = express();
const port = process.env.PORT || 3000;

const isDebugging = true;
if (!isDebugging) {
    console.log = () => { };
}

function onSocketPreError(e: Error) {
    console.log(e);
}

function onSocketPostError(e: Error) {
    console.log(e);
}

configureRoutes(app);
console.log(`Attempting to run server on port ${port}`);
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

function gracefulShutdown(signal: any) {
    if (signal) console.log(`\nReceived signal ${signal}`)
    console.log('Gracefully closing http server')

    try {
        server.close(async function (err: Error | undefined) {
            await disposeDatabase();
            if (err) {
                console.error('There was an error', err.message)
                process.exit(1)
            } else {
                console.log('http server closed successfully. Exiting!')
                process.exit(0)
            }
        })
    } catch (e: any) {
        console.error('There was an error', e.message)
        setTimeout(() => process.exit(1), 500)
    }
}

const wss = new WebSocketServer({ noServer: true });
server.on("upgrade", (req, socket, head) => {
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