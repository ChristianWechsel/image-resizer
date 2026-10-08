import { readFileSync } from "fs";
import type { Server } from "http";
import { createServer } from "../server.js";
import { get, post } from "./utils/test-client.js";

describe("Resize Image E2E Tests", () => {
  const PORT = 3000;
  const app = createServer();
  let server: Server;
  let testImageBuffer: Uint8Array<ArrayBuffer>;

  beforeAll(async () => {
    testImageBuffer = new Uint8Array(readFileSync("Test.png"));

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

  it("resize endpoint with default width 200", async () => {
    const response = await post(`http://localhost:${PORT}/resize`, {
      headers: { "Content-Type": "image/png" },
      body: testImageBuffer,
    });
    expect(response).toHaveLength(66056);
  });

  it("resize endpoint with custom size", async () => {
    const response = await post(
      `http://localhost:${PORT}/resize?width=384&height=256`,
      {
        headers: { "Content-Type": "image/png" },
        body: testImageBuffer,
      },
    );
    expect(response).toHaveLength(190664);
  });
});
