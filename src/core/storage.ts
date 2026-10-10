import type { IStorage, LogEntry } from "@christian-wechsel/logger";
import { Storage } from "@google-cloud/storage";

export class CloudStorage implements IStorage {
  private storage: Storage;

  constructor(
    private readonly projectId: string,
    private readonly bucketName: string,
  ) {
    this.storage = new Storage({ projectId: this.projectId });
  }

  upload(data: LogEntry[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
