import { Router } from "express";
import {
    getCompetition,
    setError,
    setEvent
} from "../utils";
import {
    createEvent,
    getEventById,
    getEvents,
} from "../db";
import eventRouter from "./event";


export default function eventsRouter(): Router {
    const router = Router();
    router
        .get("/", async (req, res, _) => {
            const events = await getEvents(getCompetition(req)._id!.toString());
            res.json(events);
        })
        .post("/", async (req, res, _) => {
            const event = await createEvent({
                competitionId: getCompetition(req)._id,
                ...req.body
            });

            res.json(event);
        })
        .use("/:eventId", async (req, res, next) => {
            const event = await getEventById(req.params.eventId);
            const competition = getCompetition(req);
            if (event && event.competitionId.equals(competition._id)) {
                setEvent(req, event);
                return eventRouter()(req, res, next);
            }

            setError(req, `Event with id ${req.params.eventId} was not found`);
            next();
        });

    return router;
}