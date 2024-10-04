import { Router } from "express";
import groups from "./groups";

export default function api() {
    const router = Router();

    router
        .use("/v1", apiV1())
        .use((_, res, __) => {
            res.json({
                error: "Invalid route",
            });
        });

    return router;
}

function apiV1() {
    const router = Router();
    router.use("/groups", groups());

    return router;
}