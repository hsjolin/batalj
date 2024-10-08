import { Router } from "express";
import { getEvent } from "../utils";
import {
    createScore,
    deleteEvent,
    deleteScore,
    getEventScores,
    updateEvent,
    updateScore,
} from "../db";
import scoresRouter from "./scores";

export default function eventRouter(): Router {
    const router = Router();
    router
        .get("/", (req, res, _) => {
            const event = getEvent(req);
            res.json(event);
        })
        .put("/", async (req, res, _) => {
            const result = await updateEvent(getEvent(req)._id!.toString(), req.body);
            res.json(result);
        })
        .delete("/", async (req, res, _) => {
            const result = await deleteEvent(getEvent(req)._id!.toString());
            res.json(result);
        })
        .use("/scores", scoresRouter);

    return router;
}