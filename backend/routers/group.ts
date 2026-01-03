
import { Router } from "express";
import {
    deleteGroup,
    updateGroup,
    addInviteToken,
    getGroupStatistics
} from "../db";

import {
    getGroup
} from "../utils";

import { generateInviteToken } from "../middleware/auth";
import { sendInviteEmail } from "../services/email";
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
        .post("/invite", async (req, res, _) => {
            const group = getGroup(req);
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: "Email required" });
            }

            const token = generateInviteToken();
            await addInviteToken(group._id!.toString(), token, email);

            try {
                await sendInviteEmail(email, group.slug, group.name, token);
                res.json({ success: true });
            } catch (error) {
                console.error("Failed to send invite email:", error);
                res.status(500).json({ error: "Failed to send invitation email" });
            }
        })
        .get("/statistics", async (req, res, _) => {
            const group = getGroup(req);
            const stats = await getGroupStatistics(group._id!.toString());
            res.json(stats);
        })
        .use("/contacts", contactsRouter())
        .use("/competitions", competitionsRouter());

    return router;
}