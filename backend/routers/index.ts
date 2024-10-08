import express, { Application, Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import api from "./api";

export function configure(app: Application) {
    app
        .use(express.static("public"))
        .use(json())
        .use("/api", api());
}