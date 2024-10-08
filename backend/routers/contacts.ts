import { Router } from "express";
import { getGroup, setContact } from "../utils";
import {
    createContact, 
    getContactById, 
    getContacts 
} from "../db";
import contactRouter from "./contact";

export default function contactsRouter(): Router {
    const router = Router();
    router
        .get("/", async (req, res, _) => {
            const contacts = await getContacts(getGroup(req)._id?.toString()!);
            res.json(contacts);
        })
        .post("/", async (req, res, _) => {
            const contact = await createContact({
                groupId: getGroup(req)._id,
                ...req.body
            });

            res.json(contact);
        })
        .use("/:contactId", async (req, res, next) => {
            const contact = await getContactById(req.params.contactId);
            const group = getGroup(req);

            if (contact && contact.groupId.equals(group._id)) {
                setContact(req, contact);
                return contactRouter()(req, res, next);
            } 
          
            res.status(404).send(`Contact with id ${req.params.contactId} was not found`);
        });

    return router;
}