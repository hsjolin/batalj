import { synchronize } from "./api";

let webSocket;
let callbacks = [];
let currentCallbackKey = 0;

export function openWebsocketConnection(groupSlug) {
    if (webSocket && (
        webSocket.readyState == WebSocket.CONNECTING ||
        webSocket.readyState == WebSocket.OPEN
    )) {
        return;
    }

    closeWebsocketConnection();
    webSocket = new WebSocket(createWebSocketUrlFromGroupSlug(groupSlug));
    
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

        // Map "event" to "activity" for backward compatibility
        const entityType = messageObject.type === "event" ? "activity" : messageObject.type;
        synchronize(entityType === "activity" ? "activities" : entityType, messageObject.uri);

        webSocketEventCallback({
            isError: false,
            type: "message",
            message: entityType
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

export function addWebsocketListener(groupSlug, eventFunction) {
    const existingCallback = callbacks.find(c => c.eventFunction === eventFunction);
    let key = currentCallbackKey;
    if (!existingCallback) {
        key = ++currentCallbackKey;
        callbacks.push({
            key: currentCallbackKey,
            eventFunction
        });

        if (callbacks.length == 1) {
            openWebsocketConnection(groupSlug);
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

function createWebSocketUrlFromGroupSlug(groupSlug) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/${groupSlug}`;
}   