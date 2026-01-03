import { Router } from "express";
import { setError, setGroup } from "../utils";
import {
    createGroup,
    getGroupById,
} from "../db";
import groupRouter from "./group";

export default function groupsRouter(): Router {
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

            setError(req, `Group with id ${req.params.groupId} was not found`);
            next();
        });

    return router;
}