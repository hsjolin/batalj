import express from "express";
import { configure as configureRoutes } from "./routers";
import { dispose as disposeDatabase } from "./db";
import WSServer from "./websockets/server";

const app = express();
const port = process.env.PORT || 3000;

const isDebugging = true;
if (!isDebugging) {
    console.log = () => { };
}

configureRoutes(app);
console.log(`Attempting to run server on port ${port}`);
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

const wsServer = new WSServer(server);

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

function gracefulShutdown(signal: any) {
    if (signal) {
        console.log(`\nReceived signal ${signal}`);
    }

    console.log('Gracefully closing http server')

    try {
        wsServer.dispose();
        server.close(async function (err: Error | undefined) {
            await disposeDatabase();

            if (err) {
                console.error('There was an error', err.message)
                process.exit(1)
            } else {
                console.log('http server closed successfully. Exiting!')
                process.exit(0)
            }
        })
    } catch (e: any) {
        console.error('There was an error', e.message)
        setTimeout(() => process.exit(1), 500)
    }
}