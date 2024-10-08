import { Router } from "express";
import {
    getEvent
} from "../utils";
import {
    createScore,
    deleteScore,
    getEventScores,
    updateScore
} from "../db";

export default function scoresRouter(): Router {
    const router = Router();
    router
        .get("/scores", async (req, res, _) => {
            const event = getEvent(req);
            const scores = await getEventScores(event._id!.toString());
            res.json(scores);
        })
        .post("/scores", async (req, res, _) => {
            const event = getEvent(req);
            const score = await createScore({
                eventId: event._id!,
                ...req.body
            });

            res.json(score);
        })
        .put("/scores/:scoreId", async (req, res, _) => {
            const result = await updateScore(req.params.scoreId, req.body);
            res.json(result);
        })
        .delete("/scores/:scoreId", async (req, res, _) => {
            const result = await deleteScore(req.params.scoreId);
            res.json(result);
        });

    return router;
}