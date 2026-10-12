import { apiKey } from "./utils/test-api-key.js";
import { post } from "./utils/test-client.js";
import { TestImage } from "./utils/test-image.js";
import { TestServer } from "./utils/test-server.js";

describe("Resize Image E2E Tests", () => {
  const testServer = new TestServer({ apiKey });
  const testImage = TestImage.getInstance();

  beforeAll(async () => {
    await testServer.start();
  });

  afterAll(async () => {
    await testServer.stop();
  });

  it("root endpoint should return not found", async () => {
    const response = await fetch(`${testServer.baseUrl}/`);
    expect(response.status).toBe(404);
  });

  it("health check endpoint should return success when healthy", async () => {
    const response = await fetch(`${testServer.baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", log: [] });
  });

  it("resize endpoint with default width 200", async () => {
    const response = await post(`${testServer.baseUrl}/resize`, {
      headers: {
        "Content-Type": "image/png",
        Authorization: `Bearer ${apiKey}`,
      },
      body: testImage.getBuffer(),
    });
    expect(response).toHaveLength(66056);
  });

  it("resize endpoint with custom size", async () => {
    const response = await post(
      `${testServer.baseUrl}/resize?width=384&height=256`,
      {
        headers: {
          "Content-Type": "image/png",
          Authorization: `Bearer ${apiKey}`,
        },
        body: testImage.getBuffer(),
      },
    );
    expect(response).toHaveLength(190664);
  });
});
