import express, { Application, Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import api from "./api";
import { resolve } from "path";

var _dataUpdatedListener = (c: DataUpdatedContext) => { };

export function setDataUpdatedListener(listener: (context: DataUpdatedContext) => void) {
    _dataUpdatedListener = listener;
}

export function onDataUpdated(context: DataUpdatedContext) {
    console.log(context);
    _dataUpdatedListener(context);
}

export interface DataUpdatedContext {
    type: EntityType,
    groupId: string,
    uri: string
}

export type EntityType =
    "competition" |
    "contact" |
    "event" |
    "group" |
    "score";

export function configure(app: Application) {
    app
        .get("/", (_, res, __) => {
            res.sendFile(resolve(__dirname, "../index.html"));
        })
        .use(express.static("public"))
        .use(json())
        .use((req, res, next)=> {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        })
        .use("/api", api());
}

