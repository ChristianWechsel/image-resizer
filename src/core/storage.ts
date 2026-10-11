import type { IStorage, LogEntry, Logger } from "@christian-wechsel/logger";
import { Bucket, Storage } from "@google-cloud/storage";
import { EOL } from "os";

export class CloudStorage implements IStorage {
  private storage: Storage;
  private bucket: Bucket;
  private logger?: Logger;

  constructor(
    private params: {
      projectId: string;
      bucketName: string;
      appName: string;
    },
  ) {
    this.storage = new Storage({ projectId: this.params.projectId });
    this.bucket = this.storage.bucket(this.params.bucketName);
  }

  async upload(data: LogEntry[]): Promise<void> {
    return this.bucket
      .file(this.getFileName())
      .save(this.transformLogs(data))
      .then(() => {
        this.logger?.info(`Successfully uploaded log entries`);
      })
      .catch((err) => {
        this.logger?.error(`Error uploading log entries: ${err}`);
      });
  }

  addLogger(logger: Logger) {
    this.logger = logger;
  }

  checkConnection() {
    return this.bucket
      .exists()
      .then((exists) => {
        const isBucketExists = exists[0];
        this.logger?.info(`Bucket existence: ${isBucketExists}`);
        return isBucketExists;
      })
      .catch((err) => {
        this.logger?.error(`Error checking bucket existence: ${err}`);
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
