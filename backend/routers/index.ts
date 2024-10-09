import express, { Application, Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import api from "./api";

var _dataUpdatedListener = (c: DataUpdatedContext) => { };

export function setDataUpdatedListener(listener: (context: DataUpdatedContext) => void) {
    _dataUpdatedListener = listener;
}

export interface DataUpdatedContext {
    type: UpdatedType,
    groupId: string
}

export type UpdatedType =
    "competition" |
    "contact" |
    "event" |
    "group" |
    "score";

export function configure(app: Application) {
    app
        .use(express.static("public"))
        .use(json())
        .use("/api", api());
}