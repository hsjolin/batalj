import { WebSocketServer } from "ws";
import http from "http";
import { setDataUpdatedListener } from "../db";

export default class WSServer {
    wss = new WebSocketServer({ noServer: true });

    constructor(server: http.Server) {
        this.wss.on("connection", (ws, req) => {
            ws.on("error", onSocketPostError);
            ws.on("message", msg => { console.log(msg.toString()); });
            ws.on("close", () => {
                console.log("Client connection closed");
            });
        });

        server.on("upgrade", (req, socket, head) => {
            socket.on("error", onSocketPreError);

            // Perform authentication based on group id (and pwd) here.

            this.wss.handleUpgrade(req, socket, head, (ws) => {
                socket.removeListener("error", onSocketPreError);
                this.wss.emit("connection", ws, req);
            });
        });

        setDataUpdatedListener(context => {
            // TODO: Based on information in context filter out 
            // clients that should get this message
            this.wss.clients.forEach(client => {
                client.send(context.type, { binary: false});
            });
        });
    }
    
    dispose() {
        console.log("WebSocket server is shutting down...");
        this.wss.clients.forEach(client => client.close());
        console.log("WebSocket server is shutting down... DONE");
    }
}

function onSocketPreError(e: Error) {
    console.log(e);
}

function onSocketPostError(e: Error) {
    console.log(e);
}