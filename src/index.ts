import { wireObjects } from "./core/container.js";
import { createServer } from "./server.js";

let count = 0;
let isHealthy = false;

const { env, logger, requestLogger } = wireObjects((healthy) => {
  isHealthy = healthy;
  if (!healthy) {
    process.exitCode = 1;
    gracefulShutdown("LOGGER_ERROR");
  }
});

const app = createServer({
  requestLogger: requestLogger.createRequestLogger(),
  getIsHealthy: () => isHealthy,
});
const port = env.getValue("PORT");
logger.info(`NODE_ENV: ${env.getValue("NODE_ENV")}`);
logger.info(`K_SERVICE: ${env.getValue("K_SERVICE")}`);
logger.info(`K_REVISION: ${env.getValue("K_REVISION")}`);
logger.info(`K_CONFIGURATION: ${env.getValue("K_CONFIGURATION")}`);
logger.info(`PROJECT_ID: ${env.getValue("PROJECT_ID")}`);
logger.info(`STORAGE_BUCKET_NAME: ${env.getValue("STORAGE_BUCKET_NAME")}`);

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
  isHealthy = true;
});

server.on("error", (err) => {
  logger.error(`Server error: ${err}`);
  isHealthy = false;
  process.exitCode = 1;
  gracefulShutdown("ERROR");
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

function gracefulShutdown(signal: string) {
  if (count === 0) {
    logger.info(`Received ${signal}, shutting down gracefully`);

    new Promise<void>((resolveOuter) => {
      if (server.listening) {
        server.on("close", () => {
          logger.info("Server closed");
          isHealthy = false;
          resolveOuter();
        });
        server.close();
      } else {
        resolveOuter();
      }
    })
      .then(() => {
        logger.info("Shutting down logger");
        isHealthy = false;
        return logger.close();
      })
      .then(() => {})
      .catch(() => {
        process.exitCode = 1;
      })
      .finally(() => process.exit());
  }
  count++;
}
