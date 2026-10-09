import { ConsoleLogger, type Logger } from "@christian-wechsel/logger";
import { createEnv } from "./env.js";

export const env = createEnv();
export const logger: Logger = new ConsoleLogger(env.getValue("K_SERVICE"));
