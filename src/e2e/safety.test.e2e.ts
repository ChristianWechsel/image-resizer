import { apiKey } from "./utils/test-api-key.js";
import { TestImage } from "./utils/test-image.js";
import { TestServer } from "./utils/test-server.js";

describe("API Key", () => {
  const testServer = new TestServer({ apiKey });
  const testImage = TestImage.getInstance();

  beforeAll(async () => {
    await testServer.start();
  });

  afterAll(async () => {
    await testServer.stop();
  });

  it("Endpoint resize: no API Key", async () => {
    const response = await fetch(`${testServer.baseUrl}/resize`, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: testImage.getRegularImage(),
    });
    expect(response.status).toBe(401);
    expect(await response.text()).toBe("Unauthorized");
    expect(response.headers.get("WWW-Authenticate")).toBe("Bearer");
  });

  it("Endpoint resize: invalid API Key", async () => {
    const response = await fetch(`${testServer.baseUrl}/resize`, {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        Authorization: "Bearer invalid-api-key",
      },
      body: testImage.getRegularImage(),
    });
    expect(response.status).toBe(401);
    expect(await response.text()).toBe("Unauthorized");
    expect(response.headers.get("WWW-Authenticate")).toBe("Bearer");
  });

  it("Endpoint resize: block data greater then 10 MB", async () => {
    const response = await fetch(`${testServer.baseUrl}/resize`, {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        Authorization: `Bearer ${apiKey}`,
      },
      body: testImage.getOversizedData(),
    });
    expect(response.status).toBe(413);
    expect(await response.text()).toBe("Content Too Large");
  });

  it("Endpoint resize: X-power-by", async () => {
    const response = await fetch(`${testServer.baseUrl}/resize`, {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        Authorization: `Bearer ${apiKey}`,
      },
      body: testImage.getRegularImage(),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("x-powered-by")).toBeNull();
  });
});
