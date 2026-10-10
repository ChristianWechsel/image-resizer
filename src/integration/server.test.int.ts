import type { Server } from "node:http";
import { createServer } from "../server.js";

describe("Health check integration", () => {
  let server: Server;
  let baseUrl: string;
  let isHealthy: boolean;
  let requestLoggerCalls: number;

  beforeAll(async () => {
    isHealthy = true;
    requestLoggerCalls = 0;

    const app = createServer({
      requestLogger: (_request, _response, next) => {
        requestLoggerCalls++;
        next();
      },
      getIsHealthy: () => isHealthy,
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
  });

  it("returns 503 when unhealthy without invoking the request logger", async () => {
    isHealthy = false;

    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(503);
    expect(await response.text()).toBe("");
    expect(requestLoggerCalls).toBe(0);
  });
});
