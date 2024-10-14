import { synchronize } from "./api";

let webSocket;
let callbacks = [];
let currentCallbackKey = 0;

export function openWebsocketConnection(groupId) {
    if (webSocket && (
        webSocket.readyState == WebSocket.CONNECTING ||
        webSocket.readyState == WebSocket.OPEN
    )) {
        return;
    }

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

        webSocketEventCallback({
            isError: false,
            type: "message",
            message: messageObject.type
        });
    });
}

function webSocketEventCallback(context) {
    const callbacksFunctions = callbacks.map(c => c.eventFunction);
    for (let i = 0; i < callbacksFunctions.length; i++) {
        callbacksFunctions[i](context);
    }
}

export function closeWebsocketConnection() {
    if (webSocket && webSocket.readyState != WebSocket.CLOSED) {
        webSocket.close();
        webSocket = undefined;
    }
}

export function addWebsocketListener(groupId, eventFunction) {
    const existingCallback = callbacks.find(c => c.eventFunction === eventFunction);
    let key = currentCallbackKey;
    if (!existingCallback) {
        key = ++currentCallbackKey;
        callbacks.push({
            key: currentCallbackKey, 
            eventFunction
        });

        if (callbacks.length == 1) {
            openWebsocketConnection(groupId);
        }
    }

    return key;
}

export function removeWebsocketListener(key) {
    const callback = callbacks.find(c => c.key === key);
    if (!callback) {
        return;
    }

    callbacks.splice(callbacks.indexOf(callback), 1);
    if (callbacks.length == 0) {
        closeWebsocketConnection();
    }
}

function createWebSocketUrlFromGroupId(groupId) {
    return `http://localhost:3000/${groupId}`;
}   