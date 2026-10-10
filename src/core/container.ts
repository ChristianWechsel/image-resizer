import {
  ConsoleLogger,
  StorageLogger,
  type Logger,
} from "@christian-wechsel/logger";
import { RequestLogger } from "@christian-wechsel/logger-middleware";
import { createEnv } from "./env.js";
import { CloudStorage } from "./storage.js";

export function wireObjects() {
  const env = createEnv();

  const storage = new CloudStorage(
    env.getValue("PROJECT_ID"),
    env.getValue("STORAGE_BUCKET_NAME"),
  );
  const logger: Logger =
    env.getValue("NODE_ENV") === "production"
      ? new StorageLogger(env.getValue("K_SERVICE"), storage)
      : new ConsoleLogger(env.getValue("K_SERVICE"));
  const requestLogger = new RequestLogger(logger);

  return { env, storage, logger, requestLogger };
}
