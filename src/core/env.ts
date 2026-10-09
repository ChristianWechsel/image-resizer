import { HandleEnv } from "@christian-wechsel/typed-env-handler";

type RunEnvironment = "development" | "production" | "test";

export function createEnv() {
  return new HandleEnv<{
    NODE_ENV: RunEnvironment;
    PORT: number;
    K_SERVICE: string;
    K_REVISION: string;
    K_CONFIGURATION: string;
    PROJECT_ID: string;
    STORAGE_BUCKET_NAME: string;
  }>({
    NODE_ENV: {
      defaultValue: "production",
      conversion(value) {
        return value as RunEnvironment;
      },
      validation(value) {
        return ["development", "production", "test"].includes(value);
      },
    },
    PORT: HandleEnv.number(),
    K_SERVICE: HandleEnv.string(),
    K_REVISION: HandleEnv.string(),
    K_CONFIGURATION: HandleEnv.string(),
    PROJECT_ID: HandleEnv.string(),
    STORAGE_BUCKET_NAME: HandleEnv.string(),
  });
}
