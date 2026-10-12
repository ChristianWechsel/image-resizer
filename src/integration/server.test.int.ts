import type { Server } from "node:http";
import { Health } from "../core/health.js";
import { apiKey } from "../e2e/utils/test-api-key.js";
import { createServer } from "../server.js";

describe("Health check integration", () => {
  let server: Server;
  let baseUrl: string;
  let health: Health;
  let requestLoggerCalls: number;

  beforeAll(async () => {
    health = new Health();
    requestLoggerCalls = 0;

    const app = createServer({
      requestLogger: (_request, _response, next) => {
        requestLoggerCalls++;
        next();
      },
      health,
      apiKey,
    });

    await new Promise<void>((resolve, reject) => {
      server = app.listen(0, () => resolve());
      server.once("error", reject);
    });

    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("Expected the test server to listen on a TCP port");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  });

  beforeEach(() => {
    requestLoggerCalls = 0;
    health.setStatus("ok");
  });

  it("returns 200 with status body when healthy without invoking the request logger", async () => {
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", log: [] });
    expect(requestLoggerCalls).toBe(0);
  });

  it("returns 503 with status body when unhealthy without invoking the request logger", async () => {
    health.setStatus("not-ok");

    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "not-ok", log: [] });
    expect(requestLoggerCalls).toBe(0);
  });
});
