import {
  ConsoleLogger,
  StorageLogger,
  type Logger,
} from "@christian-wechsel/logger";
import { RequestLogger } from "@christian-wechsel/logger-middleware";
import { createEnv } from "./env.js";
import { Health } from "./health.js";
import { CloudStorage } from "./storage.js";

export function wireObjects() {
  const env = createEnv();
  const appName = env.getValue("K_SERVICE");
  const health = new Health();

  const storage = new CloudStorage({
    appName,
    bucketName: env.getValue("STORAGE_BUCKET_NAME"),
    health,
    projectId: env.getValue("PROJECT_ID"),
  });

  const storageLoggerInstance = new StorageLogger(appName, storage, {
    batch: { threshold: 2 },
  });
  storageLoggerInstance.onError((err) => {
    health.setStatus("not-ok");
    health.addLog(`${err}`);
  });

  const logger: Logger =
    env.getValue("NODE_ENV") === "production"
      ? storageLoggerInstance
      : new ConsoleLogger(appName);
  const requestLogger = new RequestLogger(logger);

  return { env, storage, logger, requestLogger, health };
}
