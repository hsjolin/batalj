import { Router } from "express";
import groupRouter from "./group";
import { createGroup, getGroupById } from "../db";
import { setGroup } from "../utils";

export default function api() {
    const router = Router();

    router
        .use("/v1", apiV1())
        .use((_, res, __) => {
            res.json({
                error: "Invalid route",
            });
        });

    return router;
}

function apiV1() {
    const router = Router();
    router
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

            res.status(404).send(`Group with id ${req.params.groupId} was not found`);
        });

    return router;
}