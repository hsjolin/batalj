
import { Router } from "express";
import {
    deleteGroup,
    updateGroup
} from "../db";

import {
    getGroup
} from "../utils";

import competitionsRouter from "./competitions";
import contactsRouter from "./contacts";

export default function groupRouter() {
    const router = Router();
    router
        .get("/", (req, res, _) => {
            const group = getGroup(req);
            res.json(group);
        })
        .put("/", async (req, res, _) => {
            const group = getGroup(req);
            const result = await updateGroup(group._id!.toString(), req.body);
            res.json(result);
        })
        .delete("/", async (req, res, _) => {
            const group = getGroup(req);
            const result = await deleteGroup(group._id!.toString());
            res.json(result);
        })
        .use("/contacts", contactsRouter())
        .use("/competitions", competitionsRouter());

    return router;
}