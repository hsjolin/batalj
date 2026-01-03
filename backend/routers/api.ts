import { Router } from "express";
import cookieParser from "cookie-parser";
import groupRouter from "./group";
import authRouter from "./auth";
import { createGroup, getGroupBySlug, generateUniqueSlug } from "../db";
import { getError, getGroup, setError, setGroup } from "../utils";
import { Request, ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { EntityType, onDataUpdated } from ".";
import { hashPassword } from "../middleware/auth";

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
        .use(cookieParser())
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
        .use("/auth", authRouter())
        .get("/health", async (_, res, __) => {
            res.json({result: "Everything is alright ❤️"})
        })
        .post("/groups", async (req, res, _) => {
            const { name, password } = req.body;

            if (!name || !password) {
                return res.status(400).json({ error: "Name and password required" });
            }

            const slug = await generateUniqueSlug(name);
            const group = await createGroup({
                name,
                notes: '',
                slug,
                password: hashPassword(password),
                inviteTokens: []
            });

            res.json(group);
        })
        .use("/groups/:groupSlug", async (req, res, next) => {
            const group = await getGroupBySlug(req.params.groupSlug);
            if (group) {
                setGroup(req, group);
                return groupRouter()(req, res, next);
            }

            setError(req, `Group with slug ${req.params.groupSlug} was not found`);
            next();
        });

    return router;
}

function tryGetUriFromRequest(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): string | null {
    const url = req.originalUrl;
    const segments = [
        url.indexOf("contacts") + "contacts".length,
        url.indexOf("competitions") + "competitions".length,
        url.indexOf("groups") + "groups".length,
        url.indexOf("events") + "events".length,
        url.indexOf("activities") + "activities".length,
        url.indexOf("scores") + "scores".length
    ];

    return req.originalUrl.substring(0, Math.max(...segments));
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
        case "activities":
            return "activity";
        case "scores":
            return "score";
        default:
            return null;
    }
}
