import { Router } from "express";
import { getCompetition } from "../utils";
import {
    deleteCompetition, 
    updateCompetition, 
} from "../db";
import eventsRouter from "./events";

export default function competitionRouter(): Router {
    const router = Router();
    router
        .get("/", (req, res, _) => {
            const competition = getCompetition(req);
            res.json(competition);
        })
        .put("/", async (req, res, _) => {
            const result = await updateCompetition(getCompetition(req)._id!.toString(), req.body);
            res.json(result);
        })
        .delete("/", async (req, res, _) => {
            const result = await deleteCompetition(getCompetition(req)._id!.toString());
            res.json(result);
        })
        .use("/events", eventsRouter());

    return router;
}