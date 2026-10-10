import {
  ConsoleLogger,
  StorageLogger,
  type Logger,
} from "@christian-wechsel/logger";
import { RequestLogger } from "@christian-wechsel/logger-middleware";
import { createEnv } from "./env.js";
import { CloudStorage } from "./storage.js";

export function wireObjects(setIsHealty: (isHealthy: boolean) => void) {
  const env = createEnv();
  const appName = env.getValue("K_SERVICE");

  const storage = new CloudStorage(
    env.getValue("PROJECT_ID"),
    env.getValue("STORAGE_BUCKET_NAME"),
    appName,
  );

  const storageLoggerInstance = new StorageLogger(appName, storage);
  storageLoggerInstance.onError(() => {
    setIsHealty(false);
  });

  const logger: Logger =
    env.getValue("NODE_ENV") === "production"
      ? storageLoggerInstance
      : new ConsoleLogger(appName);
  const requestLogger = new RequestLogger(logger);

  return { env, storage, logger, requestLogger };
}
