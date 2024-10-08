import { Router } from "express";
import { getContact } from "../utils";
import {
    deleteContact,
    updateContact
} from "../db";

export default function contactRouter(): Router {
    const router = Router();
    router
        .get("/", (req, res, _) => {
            const contact = getContact(req);
            res.json(contact);
        })
        .put("/", async (req, res, _) => {
            const result = await updateContact(getContact(req)._id?.toString()!, req.body);
            res.json(result);
        })
        .delete("/", async (req, res, _) => {
            const result = await deleteContact(getContact(req)._id?.toString()!);
            res.json(result);
        });

    return router;
}