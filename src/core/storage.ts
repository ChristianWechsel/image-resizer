import type { IStorage, LogEntry } from "@christian-wechsel/logger";
import { Bucket, Storage } from "@google-cloud/storage";
import { EOL } from "os";
import type { Health } from "./health.js";

export class CloudStorage implements IStorage {
  private storage: Storage;
  private bucket: Bucket;

  constructor(
    private params: {
      projectId: string;
      bucketName: string;
      appName: string;
      health: Health;
    },
  ) {
    this.storage = new Storage({ projectId: this.params.projectId });
    this.bucket = this.storage.bucket(this.params.bucketName);
  }

  checkConnection() {
    return this.bucket
      .exists()
      .then((exists) => {
        this.params.health.addLog(`Bucket exists: ${JSON.stringify(exists)}`);
      })
      .catch((err) => {
        this.params.health.addLog(
          `Error checking bucket existence: ${err}`,
        );
      });
  }

  async upload(data: LogEntry[]): Promise<void> {
    await this.checkConnection();
    return this.bucket
      .file(this.getFileName())
      .save(this.transformLogs(data))
      .then((err) => {
        this.params.health.addLog(`Successfully uploaded log entries: ${err}`);
      })
      .catch((err) => {
        this.params.health.addLog(`Error uploading log entries: ${err}`);
      });
  }

  private transformLogs(logs: LogEntry[]): string {
    return logs.map(this.transformLog).join(EOL);
  }

  private transformLog(log: LogEntry): string {
    return JSON.stringify(log);
  }

  private getFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `${this.params.appName}-${timestamp}.jsonl`;
  }
}
