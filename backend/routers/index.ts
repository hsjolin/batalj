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
    "activity" |
    "group" |
    "score";

export function configure(app: Application) {
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? ['https://bk.familjensjolin.com']
        : ['http://localhost:5173', 'http://localhost:3000'];

    app
        .get("/", (_, res, __) => {
            res.sendFile(resolve(__dirname, "../index.html"));
        })
        .use(express.static("public"))
        .use(json())
        .use((req, res, next) => {
            const origin = req.headers.origin;
            if (origin && allowedOrigins.includes(origin)) {
                res.header('Access-Control-Allow-Origin', origin);
                res.header('Access-Control-Allow-Credentials', 'true');
            }
            res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }

            next();
        })
        .use("/api", api());
}

