import { env, logger, requestLogger } from "./core/container.js";
import { createServer } from "./server.js";

const app = createServer({
  requestLogger: requestLogger.createRequestLogger(),
});
const port = env.getValue("PORT");
logger.info(`NODE_ENV: ${env.getValue("NODE_ENV")}`);
logger.info(`K_SERVICE: ${env.getValue("K_SERVICE")}`);
logger.info(`K_REVISION: ${env.getValue("K_REVISION")}`);
logger.info(`K_CONFIGURATION: ${env.getValue("K_CONFIGURATION")}`);

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

server.on("close", () => {
  logger.info("Server closed");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down gracefully");
  server.close();
});

process.on("SIGKILL", () => {
  logger.error("Received SIGKILL, shutting down immediately");
  process.exit(1);
});
