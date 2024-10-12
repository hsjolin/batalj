import { synchronize } from "./api";

let webSocket;
let callbacks = {};
let indexCounter = 0;

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

function webSocketEventCallback(context) {
    const callbacksFunctions = Object.values(callbacks);
    for (let i = 0; i < callbacksFunctions.length; i++) {
        callbacksFunctions[i](context);
    }
}

export function closeWebsocketConnection() {
    if (webSocket) {
        webSocket.close();
        webSocket = undefined;
    }
}

export function addWebsocketListener(groupId, eventFunction) {
    const values = Object.values(callbacks);
    const keys = Object.keys(callbacks);

    const existingKey = keys[values.indexOf(eventFunction)];
    const key = (indexCounter + 1).toString();
    if (!existingKey) {
        callbacks[key] = eventFunction;
        indexCounter++;
        if (Object.keys(callbacks).length == 1) {
            openWebsocketConnection(groupId);
        }
    }

    return existingKey ?? key;
}

export function removeWebsocketListener(key) {
    const keys = Object.keys(callbacks)
        .filter(k => k !== key);

    const callbacksCopy = { ...callbacks };
    callbacks = {};

    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        callbacks[k] = callbacksCopy[k];
    }

    if (Object.keys(callbacks).length == 0) {
        closeWebsocketConnection();
    }
}

function createWebSocketUrlFromGroupId(groupId) {
    return `http://localhost:3000/${groupId}`;
}