import type { Server } from "http";
import { Health } from "../../core/health.js";
import { createServer } from "../../server.js";

type LogEntries = {
  logs: string[];
};

export class TestServer {
  private static port = 3000;

  public static getNextPort() {
    return this.port++;
  }

  private app: ReturnType<typeof createServer>;
  private server?: Server;

  constructor(private params: { port: number; apiKey: string }) {
    this.app = createServer({
      requestLogger: (_req, _res, next) => {
        next();
      },
      health: new Health(),
      apiKey: this.params.apiKey,
    });
  }
  start(): Promise<LogEntries> {
    return new Promise<LogEntries>((resolve, reject) => {
      this.server = this.app.listen(this.params.port);
      this.server.once("listening", () => {
        resolve({ logs: ["Server started successfully"] });
      });
      this.server.once("error", (err) => {
        reject(err);
      });
    });
  }

  stop(): Promise<LogEntries> {
    return new Promise<LogEntries>((resolve, reject) => {
      if (!this.server) {
        reject(new Error("Server is not running"));
      } else {
        this.server?.once("close", () => {
          resolve({ logs: ["Server stopped successfully"] });
        });
        this.server?.once("error", (err) => {
          reject(err);
        });
        this.server?.close();
      }
    });
  }
}
