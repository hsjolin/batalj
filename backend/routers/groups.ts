
import { Router } from "express";
import { createContact, deleteContact, getContacts, updateContact } from "../db";

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
        .put("/:groupId/contacts/:contactId", async (req, res, _) => {
            const result = await updateContact(req.params.contactId, req.body);
            res.json(result);
        })
        .delete("/:groupId/contacts/:contactId", async (req, res, _) => {
            const result = await deleteContact(req.params.contactId);
            res.json(result);
        });

    return router;
}