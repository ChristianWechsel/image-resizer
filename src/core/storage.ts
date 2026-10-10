import type { IStorage, LogEntry } from "@christian-wechsel/logger";
import { Storage } from "@google-cloud/storage";
import { EOL } from "os";

export class CloudStorage implements IStorage {
  private storage: Storage;

  constructor(
    private readonly projectId: string,
    private readonly bucketName: string,
    private readonly appName: string,
  ) {
    this.storage = new Storage({ projectId: this.projectId });
  }

  async upload(data: LogEntry[]): Promise<void> {
    await this.storage
      .bucket(this.bucketName)
      .file(this.getFileName())
      .save(this.transformLogs(data));
  }

  private transformLogs(logs: LogEntry[]): string {
    return logs.map(this.transformLog).join(EOL);
  }

  private transformLog(log: LogEntry): string {
    return JSON.stringify(log);
  }

  private getFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `${this.appName}-${timestamp}.jsonl`;
  }
}
