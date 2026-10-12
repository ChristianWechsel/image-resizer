import { apiKey } from "./utils/test-api-key.js";
import { TestImage } from "./utils/test-image.js";
import { TestServer } from "./utils/test-server.js";

describe("API Key", () => {
  const PORT = TestServer.getNextPort();
  const testServer = new TestServer({ port: PORT, apiKey });
  const testImage = TestImage.getInstance();

  beforeAll(async () => {
    await testServer.start();
  });

  afterAll(async () => {
    await testServer.stop();
  });

  it("Endpoint resize: no API Key", async () => {
    const response = await fetch(`http://localhost:${PORT}/resize`, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: testImage.getBuffer(),
    });
    expect(response.status).toBe(401);
    expect(await response.text()).toBe("Unauthorized");
    expect(response.headers.get("WWW-Authenticate")).toBe("Bearer");
  });

  it("Endpoint resize: invalid API Key", async () => {
    const response = await fetch(`http://localhost:${PORT}/resize`, {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        Authorization: "Bearer invalid-api-key",
      },
      body: testImage.getBuffer(),
    });
    expect(response.status).toBe(401);
    expect(await response.text()).toBe("Unauthorized");
    expect(response.headers.get("WWW-Authenticate")).toBe("Bearer");
  });
});
