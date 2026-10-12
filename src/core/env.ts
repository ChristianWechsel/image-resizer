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
    API_KEY: string;
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
    API_KEY: {
      secret: true,
      conversion(value) {
        return value.trim();
      },
      validation(value) {
        // 32 Zufallsbytes als base64 (`openssl rand -base64 32`) oder base64url
        return /^[A-Za-z0-9+/_-]{43}=?$/.test(value);
      },
    },
  });
}
