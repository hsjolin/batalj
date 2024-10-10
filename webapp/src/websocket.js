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
        synchronize(messageEvent.data, messageEvent.uri);

        webSocketEventCallback({
            isError: false,
            type: "message",
            message: messageEvent.data
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