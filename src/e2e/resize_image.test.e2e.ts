import type { Server } from "http";
import { createServer } from "../server.js";
import { get } from "./utils/test-client.js";

describe("Resize Image E2E Tests", () => {
  const PORT = 3000;
  const app = createServer();
  let server: Server;

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server = app.listen(PORT);
      server.once("listening", () => {
        console.log(`Server is listening on port ${PORT}`);
        resolve();
      });
      server.once("error", (err) => {
        console.error(err);
        reject(err);
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.once("close", () => {
        console.log(`Server on port ${PORT} has been closed.`);
        resolve();
      });
      server.once("error", (err) => {
        console.error(err);
        reject(err);
      });
      server.close();
    });
  });

  it("root endpoint should return status ok", async () => {
    const response = await get(`http://localhost:${PORT}/`);
    expect(response).toEqual({ status: "ok" });
  });

  it("health check endpoint should return status ok", async () => {
    const response = await get(`http://localhost:${PORT}/health`);
    expect(response).toEqual({ status: "ok" });
  });
});
