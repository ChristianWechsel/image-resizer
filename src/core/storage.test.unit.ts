import type { LogEntry, Logger } from "@christian-wechsel/logger";
import { Storage } from "@google-cloud/storage";
import { EOL } from "os";
import { CloudStorage } from "./storage.js";

const mockSave = jest.fn();
const mockExists = jest.fn();
const mockFile = jest.fn(() => ({ save: mockSave }));
const mockBucket = jest.fn(() => ({ file: mockFile, exists: mockExists }));

jest.mock("@google-cloud/storage", () => ({
  Storage: jest.fn(() => ({ bucket: mockBucket })),
}));

function createLoggerMock(): jest.Mocked<Logger> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    close: jest.fn(),
  };
}

function createLogEntry(message: string): LogEntry {
  return {
    timestamp: new Date("2026-01-01T00:00:00.000Z"),
    level: "info",
    message,
  };
}

describe("CloudStorage", () => {
  const params = {
    appName: "test-app",
    bucketName: "test-bucket",
    projectId: "test-project",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockReset().mockResolvedValue(undefined);
    mockExists.mockReset().mockResolvedValue([true]);
  });

  describe("constructor", () => {
    it("creates the storage client for the configured project", () => {
      new CloudStorage(params);

      expect(Storage).toHaveBeenCalledWith({ projectId: "test-project" });
    });

    it("opens the configured bucket", () => {
      new CloudStorage(params);

      expect(mockBucket).toHaveBeenCalledWith("test-bucket");
    });
  });

  describe("upload", () => {
    it("saves the entries as JSON lines separated by the line separator", async () => {
      const entries = [createLogEntry("first"), createLogEntry("second")];

      await new CloudStorage(params).upload(entries);

      expect(mockSave).toHaveBeenCalledWith(
        entries.map((entry) => JSON.stringify(entry)).join(EOL),
      );
    });

    it("names the file after the app with a filesystem-safe timestamp", async () => {
      await new CloudStorage(params).upload([createLogEntry("entry")]);

      expect(mockFile).toHaveBeenCalledWith(
        expect.stringMatching(/^test-app-[\dT-]+Z\.jsonl$/),
      );
    });

    it("logs success when a logger is attached", async () => {
      const logger = createLoggerMock();
      const storage = new CloudStorage(params);
      storage.addLogger(logger);

      await storage.upload([createLogEntry("entry")]);

      expect(logger.info).toHaveBeenCalledWith(
        "Successfully uploaded log entries",
      );
    });

    it("logs the error instead of rejecting when saving fails", async () => {
      mockSave.mockRejectedValue(new Error("save failed"));
      const logger = createLoggerMock();
      const storage = new CloudStorage(params);
      storage.addLogger(logger);

      await expect(
        storage.upload([createLogEntry("entry")]),
      ).resolves.toBeUndefined();

      expect(logger.error).toHaveBeenCalledWith(
        "Error uploading log entries: Error: save failed",
      );
    });

    it("does not fail when saving fails and no logger is attached", async () => {
      mockSave.mockRejectedValue(new Error("save failed"));

      await expect(
        new CloudStorage(params).upload([createLogEntry("entry")]),
      ).resolves.toBeUndefined();
    });
  });

  describe("checkConnection", () => {
    it("returns true when the bucket exists", async () => {
      mockExists.mockResolvedValue([true]);

      expect(await new CloudStorage(params).checkConnection()).toBe(true);
    });

    it("returns false when the bucket does not exist", async () => {
      mockExists.mockResolvedValue([false]);

      expect(await new CloudStorage(params).checkConnection()).toBe(false);
    });

    it("logs the bucket existence when a logger is attached", async () => {
      const logger = createLoggerMock();
      const storage = new CloudStorage(params);
      storage.addLogger(logger);

      await storage.checkConnection();

      expect(logger.info).toHaveBeenCalledWith("Bucket existence: true");
    });

    it("logs the error and resolves to undefined when the check fails", async () => {
      mockExists.mockRejectedValue(new Error("no access"));
      const logger = createLoggerMock();
      const storage = new CloudStorage(params);
      storage.addLogger(logger);

      expect(await storage.checkConnection()).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        "Error checking bucket existence: Error: no access",
      );
    });
  });
});
