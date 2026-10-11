type HealthStatus = "ok" | "not-ok";

type HealthCheck = () => Promise<boolean>;

export class Health {
  private previousStatus: HealthStatus;
  private status: HealthStatus;
  private log: string[];
  private statusChangeCallback?: (status: HealthStatus) => void;
  private checks: HealthCheck[];

  constructor() {
    this.status = "ok";
    this.previousStatus = "ok";
    this.log = [];
    this.checks = [];
  }

  async getStatus(): Promise<HealthStatus> {
    const results = await Promise.all(this.checks.map((check) => check()));
    if (results.includes(false)) {
      this.setStatus("not-ok");
    }
    return Promise.resolve(this.status);
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

  addChecks(check: HealthCheck): void {
    this.checks.push(check);
  }
}
