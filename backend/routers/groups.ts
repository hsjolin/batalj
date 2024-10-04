
import { Router } from "express";
import { createContact, getContacts, updateContact } from "../db";

export default function groups() {
    const router = Router();
    router
        .get("/:groupId/contacts", async (req, res, _) => {
            const contacts = await getContacts(req.params.groupId);
            res.json(contacts);
        })
        .post("/:groupId/contacts", async (req, res, _) => {
            const contact = await createContact({
                groupId: req.params.groupId,
                ...req.body
            });

            res.json(contact);
        })
        .put("/:groupId/contacts", async (req, res, _) => {
            const contact = await updateContact({
                groupId: req.params.groupId,
                ...req.body
            });

            res.json(contact);
        });

    return router;
}