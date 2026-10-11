import { ConsoleLogger, StorageLogger } from "@christian-wechsel/logger";
import { RequestLogger } from "@christian-wechsel/logger-middleware";
import { wireObjects } from "./container.js";
import { createEnv } from "./env.js";
import { Health } from "./health.js";
import { CloudStorage } from "./storage.js";

const mockGetValue = jest.fn();

jest.mock("./env.js", () => ({
  createEnv: jest.fn(() => ({ getValue: mockGetValue })),
}));
jest.mock("./health.js");
jest.mock("./storage.js", () => ({
  CloudStorage: jest.fn(() => ({ addLogger: jest.fn() })),
}));
jest.mock("@christian-wechsel/logger", () => ({
  StorageLogger: jest.fn(() => ({ onError: jest.fn() })),
  ConsoleLogger: jest.fn(() => ({})),
}));
jest.mock("@christian-wechsel/logger-middleware", () => ({
  RequestLogger: jest.fn(() => ({})),
}));

function configureEnvValues(values: Record<string, string>) {
  mockGetValue.mockImplementation((key: string) => values[key]);
}

const baseEnvValues = {
  K_SERVICE: "image-resizer",
  PROJECT_ID: "test-project",
  STORAGE_BUCKET_NAME: "test-bucket",
};

describe("wireObjects", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configureEnvValues({ ...baseEnvValues, NODE_ENV: "production" });
  });

  it("returns the wired objects", () => {
    const result = wireObjects();

    expect(result.env).toBe(jest.mocked(createEnv).mock.results[0].value);
    expect(result.health).toBe(jest.mocked(Health).mock.instances[0]);
    expect(result.storage).toBe(
      jest.mocked(CloudStorage).mock.results[0].value,
    );
    expect(result.requestLogger).toBe(
      jest.mocked(RequestLogger).mock.results[0].value,
    );
  });

  it("configures the cloud storage from the environment", () => {
    wireObjects();

    expect(CloudStorage).toHaveBeenCalledWith({
      appName: "image-resizer",
      bucketName: "test-bucket",
      projectId: "test-project",
    });
  });

  it("creates the storage logger with batch threshold 1000", () => {
    wireObjects();

    expect(StorageLogger).toHaveBeenCalledWith(
      "image-resizer",
      jest.mocked(CloudStorage).mock.results[0].value,
      { batch: { threshold: 1000 } },
    );
  });

  describe("in production", () => {
    it("uses the storage logger", () => {
      const { logger } = wireObjects();

      expect(logger).toBe(jest.mocked(StorageLogger).mock.results[0].value);
      expect(ConsoleLogger).not.toHaveBeenCalled();
    });
  });

  describe.each(["development", "test"])("in %s", (nodeEnv) => {
    beforeEach(() => {
      configureEnvValues({ ...baseEnvValues, NODE_ENV: nodeEnv });
    });

    it("uses the console logger named after the service", () => {
      const { logger } = wireObjects();

      expect(ConsoleLogger).toHaveBeenCalledWith("image-resizer");
      expect(logger).toBe(jest.mocked(ConsoleLogger).mock.results[0].value);
    });
  });

  it("attaches the selected logger to the storage", () => {
    const { storage, logger } = wireObjects();

    expect(storage.addLogger).toHaveBeenCalledWith(logger);
  });

  it("creates the request logger with the selected logger", () => {
    const { logger } = wireObjects();

    expect(RequestLogger).toHaveBeenCalledWith(logger);
  });

  describe("storage logger error handling", () => {
    it("marks the health as not-ok and records the error", () => {
      const { health } = wireObjects();
      const [onErrorCallback] = jest.mocked(
        jest.mocked(StorageLogger).mock.results[0].value.onError,
      ).mock.calls[0];

      onErrorCallback(new Error("upload failed"));

      expect(health.setStatus).toHaveBeenCalledWith("not-ok");
      expect(health.addLog).toHaveBeenCalledWith("Error: upload failed");
    });
  });
});
