import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { wireObjects } from "./core/container.js";
import { createServer } from "./server.js";

let objects: ReturnType<typeof wireObjects>;
let server: Server<typeof IncomingMessage, typeof ServerResponse>;
let count = 0;

objects = wireObjects();

const app = createServer({
  requestLogger: objects.requestLogger.createRequestLogger(),
});
const port = objects.env.getValue("PORT");
objects.logger.info(`NODE_ENV: ${objects.env.getValue("NODE_ENV")}`);
objects.logger.info(`K_SERVICE: ${objects.env.getValue("K_SERVICE")}`);
objects.logger.info(`K_REVISION: ${objects.env.getValue("K_REVISION")}`);
objects.logger.info(
  `K_CONFIGURATION: ${objects.env.getValue("K_CONFIGURATION")}`,
);
objects.logger.info(`PROJECT_ID: ${objects.env.getValue("PROJECT_ID")}`);
objects.logger.info(
  `STORAGE_BUCKET_NAME: ${objects.env.getValue("STORAGE_BUCKET_NAME")}`,
);

server = app.listen(port, () => {
  objects.logger.info(`Server listening on port ${port}`);
});

server.on("error", (err) => {
  objects.logger.error(`Server error: ${err}`);
  process.exitCode = 1;
  gracefulShutdown("ERROR");
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

function gracefulShutdown(signal: string) {
  if (count === 0) {
    objects.logger.info(`Received ${signal}, shutting down gracefully`);

    new Promise<void>((resolve) => {
      if (server.listening) {
        new Promise<void>((resolve) =>
          server.on("close", () => {
            objects.logger.info("Server closed");
            resolve();
          }),
        );
        server.close();
      }
      resolve();
    })
      .then(() => {
        objects.logger.info("Shutting down logger");
        return objects.logger.close();
      })
      .then(() => {})
      .catch(() => {
        process.exitCode = 1;
      })
      .finally(() => process.exit());
  }
  count++;
}
