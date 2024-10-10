import { Router } from "express";
import groupRouter from "./group";
import { createGroup, getGroupById } from "../db";
import { getError, getGroup, setError, setGroup } from "../utils";
import { Request, ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { EntityType, onDataUpdated } from ".";

export default function api() {
    const router = Router();

    router
        .use("/v1", apiV1())
        .use((req, res, _) => {
            const error = getError(req) ?? "Not found";
            res.status(404).json({
                Message: error
            });
        });

    return router;
}

function apiV1() {
    const router = Router();
    router
        .use((req, res, next) => {
            if (["POST", "PUT", "DELETE"].includes(req.method)) {
                res.on("finish", () => {
                    const entityType = tryGetEntityTypeFromRequest(req);
                    const uri = tryGetUriFromRequest(req);
                    if (entityType && uri) {
                        const group = getGroup(req);
                        onDataUpdated({
                            groupId: group._id!.toString(),
                            type: entityType,
                            uri: uri
                        });
                    }
                });
            }

            next();
        })
        .post("/groups", async (req, res, _) => {
            const group = await createGroup(req.body);
            res.json(group);
        })
        .use("/groups/:groupId", async (req, res, next) => {
            const group = await getGroupById(req.params.groupId);
            if (group) {
                setGroup(req, group);
                return groupRouter()(req, res, next);
            }

            setError(req, `Group with id ${req.params.groupId} was not found`);
            next();
        });

    return router;
}

function tryGetUriFromRequest(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): string | null {
    const urlSegments = req.originalUrl
        .split("/")
        .filter(s => s.length > 0);
    
    return urlSegments.at(urlSegments.length - 1) ?? null;
}

function tryGetEntityTypeFromRequest(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): EntityType | null {
    let urlSegment = "";
    const urlSegments = req.originalUrl
        .split("/")
        .filter(s => s.length > 0);

    switch (req.method) {
        case "POST":
            urlSegment = urlSegments.at(urlSegments.length - 1) ?? "";
            break;
        case "PUT":
        case "DELETE":
            urlSegment = urlSegments.at(urlSegments.length - 2) ?? "";
            break;
    }

    switch (urlSegment.toLowerCase()) {
        case "competitions":
            return "competition";
        case "contacts":
            return "contact";
        case "events":
            return "event";
        case "scores":
            return "score";
        default:
            return null;
    }
}
