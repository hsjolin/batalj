import { synchronize } from "./api";

let webSocket;
let webSocketEventCallback;

export function openWebsocketConnection(groupId) {
    closeWebsocketConnection();
    webSocket = new WebSocket(createWebSocketUrlFromGroupId(groupId));

    webSocket.addEventListener("error", (e) => {
        webSocketEventCallback({
            isError: true,
            type: "error"
        });
    });

    webSocket.addEventListener("open", () => {
        webSocketEventCallback({
            isError: false,
            type: "open"
        });
    });

    webSocket.addEventListener("close", () => {
        webSocketEventCallback({
            isError: false,
            type: "close"
        });
    });

    webSocket.addEventListener("message", (messageEvent) => {
        var messageObject = JSON.parse(messageEvent.data);
        if (!messageObject) {
            console.log(`Failed to parse a message: ${messageEvent.data}`);
        }

        synchronize(messageObject.type, messageObject.uri);
        console.log(messageObject);
        
        webSocketEventCallback({
            isError: false,
            type: "message",
            message: messageObject.type
        });
    });
}

export function closeWebsocketConnection() {
    if (webSocket) {
        webSocket.close();
        webSocket = undefined;
    }
}

export function onWebsocketEvent(eventFunction) {
    webSocketEventCallback = eventFunction;
}

function createWebSocketUrlFromGroupId(groupId) {
    return `http://localhost:3000/${groupId}`;
}