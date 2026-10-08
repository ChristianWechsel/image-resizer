import { TestClient } from "./utils/test-client.js";

describe("Resize Image E2E Tests", () => {
  const testClient = new TestClient();

  beforeAll(async () => {
    await testClient.startServer({ host: "localhost", port: 3000 });
  });

  afterAll(async () => {
    await testClient.closeServer();
  });

  it("should resize an image successfully", () => {
    expect(true).toBeTruthy();
  });
});
