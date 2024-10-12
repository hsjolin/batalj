import { WebSocketServer } from "ws";
import http from "http";
import { setDataUpdatedListener } from "../routers";
import { getGroupById } from "../db";

export default class WSServer {
    wss = new WebSocketServer({ noServer: true });

    constructor(server: http.Server) {
        this.wss.on("connection", (ws, req) => {
            ws.on("error", onSocketPostError);
            ws.on("message", msg => { console.log(msg.toString()); });
        });

        server.on("upgrade", async (req, socket, head) => {
            socket.on("error", onSocketPreError);

            const groupId = req.url?.replace("/", "");
            if (!groupId) {
                return new Error("Expected group id in url");
            }

            const group = await getGroupById(groupId);
            if (!group) {
                return new Error(`Unable to find group with id ${groupId}`);
            }

            this.wss.handleUpgrade(req, socket, head, (client) => {
                socket.removeListener("error", onSocketPreError);
                (client as any).group = group;
                this.wss.emit("connection", client, req);
            });
        });

        setDataUpdatedListener(context => {
            console.log(`Message of type '${context.type}' recieved. Distributing to ${this.wss.clients.size} clients`);
            this.wss.clients
                .forEach(client => {
                    if ((client as any).group?._id.toString() === context.groupId) {
                        client.send(JSON.stringify(context), { binary: false });
                    }
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