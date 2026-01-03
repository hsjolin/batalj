import { Router } from "express";
import { setError, setGroup } from "../utils";
import {
    createContact,
    createGroup,
    deleteGroup,
    getGroupById,
} from "../db";
import groupRouter from "./group";

export default function groupsRouter(): Router {
    const router = Router();
    router
        // .post("/groups", async (req, res, _) => {
        //     const group = await createGroup(req.body);
        //     if (group && group._id) {
        //         const contact = await createContact({
        //             first: `${group?.name}`,
        //             last: "användare",
        //             notes: "Detta är en första användare som skapats i gruppen, uppdatera denna och gör den till din 👍️",
        //             groupId: group._id,
        //             avatar: ""
        //         });

        //         if(!contact) {
        //             await deleteGroup(group._id.toString())
        //             throw Error("Unable to create group");
        //         }
        //     }

        //     res.json(group);
        // })
        .use("/groups/:groupId", async (req, res, next) => {
            const group = await getGroupById(req.params.groupId);
            if (group) {
                setGroup(req, group);
                return groupRouter()(req, res, next);
            }

            setError(req, `Group with id ${req.params.groupId} was not found`);
            next();
        });

    return router;
}