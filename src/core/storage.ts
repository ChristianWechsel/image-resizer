import { Storage } from "@google-cloud/storage";

export class CloudStorage {
  private storage: Storage;

  constructor(
    private readonly projectId: string,
    private readonly bucketName: string,
  ) {
    this.storage = new Storage({ projectId: this.projectId });
  }
}
