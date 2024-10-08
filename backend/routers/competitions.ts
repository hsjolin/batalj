import { Router } from "express";
import { getGroup, setCompetition } from "../utils";
import {
    createCompetition,
    getCompetitionById,
    getCompetitions,
} from "../db";
import competitionRouter from "./competition";


export default function competitionsRouter(): Router {
    const router = Router();
    router
        .get("/", async (req, res, _) => {
            const competitions = await getCompetitions(getGroup(req)._id?.toString()!);
            res.json(competitions);
        })
        .post("/", async (req, res, _) => {
            const competition = await createCompetition({
                groupId: getGroup(req)._id,
                ...req.body
            });

            res.json(competition);
        })
        .use("/:competitionId", async (req, res, next) => {
            const competition = await getCompetitionById(req.params.competitionId);
            const group = getGroup(req);
            if (competition && competition.groupId.equals(group._id)) {
                setCompetition(req, competition);
                return competitionRouter()(req, res, next);
            } 
            
            res.status(404).send(`Competition with id ${req.params.competitionId} was not found`);
        });

    return router;
}