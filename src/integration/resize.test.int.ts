import sharp from "sharp";
import { apiKey } from "../e2e/utils/test-api-key.js";
import { TestImage } from "../e2e/utils/test-image.js";
import { TestServer } from "../e2e/utils/test-server.js";
import {
  ResizeTestdataFactory,
  type ResizeTestdata,
} from "./resize.testdata.js";

describe("Resize endpoint integration", () => {
  let requestLoggerCalls = 0;
  const testServer = new TestServer({
    apiKey,
    requestLogger: (_request, _response, next) => {
      requestLoggerCalls++;
      next();
    },
  });
  const sourceImage = TestImage.getInstance().getRegularImage();

  beforeAll(async () => {
    await testServer.start();
  });

  afterAll(async () => {
    await testServer.stop();
  });

  beforeEach(() => {
    requestLoggerCalls = 0;
  });

  function postImage(query: string, body: Uint8Array<ArrayBuffer>) {
    return fetch(`${testServer.baseUrl}/resize${query}`, {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });
  }

  const testData = new ResizeTestdataFactory();
  it.each<ResizeTestdata>([
    testData.default_width(),
    testData.custom_width(),
    testData.width_and_height(),
    testData.height_only(),
  ])("$name", async ({ query, expectedWidth, expectedHeight }) => {
    const response = await postImage(query, sourceImage);
    const metadata = await sharp(
      Buffer.from(await response.arrayBuffer()),
    ).metadata();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(expectedWidth);
    expect(metadata.height).toBe(expectedHeight);
  });

  it("invokes the request logger for resize requests", async () => {
    await postImage("", sourceImage);

    expect(requestLoggerCalls).toBe(1);
  });

  it("keeps serving requests after a payload that is not an image", async () => {
    await expect(
      postImage("", new TextEncoder().encode("no image")),
    ).rejects.toThrow();

    const response = await postImage("", sourceImage);

    expect(response.status).toBe(200);
  });
});
