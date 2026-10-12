import type { Server } from "http";
import { Health } from "../../core/health.js";
import { createServer } from "../../server.js";

type LogEntries = {
  logs: string[];
};

export class TestServer {
  private app: ReturnType<typeof createServer>;
  private server?: Server;

  constructor(
    private params: {
      apiKey: string;
      requestLogger?: Parameters<typeof createServer>[0]["requestLogger"];
    },
  ) {
    this.app = createServer({
      requestLogger:
        this.params.requestLogger ??
        ((_req, _res, next) => {
          next();
        }),
      health: new Health(),
      apiKey: this.params.apiKey,
    });
  }
  get baseUrl(): string {
    const address = this.server?.address();
    if (!address || typeof address === "string") {
      throw new Error("Server is not running");
    }
    return `http://localhost:${address.port}`;
  }

  start(): Promise<LogEntries> {
    return new Promise<LogEntries>((resolve, reject) => {
      // Port 0: the OS picks a free port, so parallel test files cannot collide
      this.server = this.app.listen(0);
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
