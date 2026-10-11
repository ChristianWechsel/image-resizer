type HealthStatus = "ok" | "not-ok";

export class Health {
  private previousStatus: HealthStatus;
  private status: HealthStatus;
  private log: string[];
  private statusChangeCallback?: (status: HealthStatus) => void;

  constructor() {
    this.status = "ok";
    this.previousStatus = "ok";
    this.log = [];
  }

  getStatus(): HealthStatus {
    return this.status;
  }

  setStatus(status: HealthStatus): void {
    if (this.previousStatus !== status && this.statusChangeCallback) {
      this.statusChangeCallback(status);
    }
    this.previousStatus = this.status;
    this.status = status;
  }

  addLog(entry: string): void {
    this.log.push(entry);
  }

  getLog(): string[] {
    return this.log;
  }

  onStatusChange(callback: (status: HealthStatus) => void): void {
    this.statusChangeCallback = callback;
  }
}
