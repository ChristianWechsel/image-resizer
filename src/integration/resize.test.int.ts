import type { Server } from "node:http";
import sharp from "sharp";
import { Health } from "../core/health.js";
import { createServer } from "../server.js";
import {
  ResizeTestdataFactory,
  sourceImageSize,
  type ResizeTestdata,
} from "./resize.testdata.js";

describe("Resize endpoint integration", () => {
  let server: Server;
  let baseUrl: string;
  let requestLoggerCalls: number;
  let sourceImage: Uint8Array<ArrayBuffer>;

  beforeAll(async () => {
    const pngBuffer = await sharp({
      create: {
        ...sourceImageSize,
        channels: 3,
        background: { r: 200, g: 50, b: 50 },
      },
    })
      .png()
      .toBuffer();
    sourceImage = new Uint8Array(pngBuffer);

    const app = createServer({
      requestLogger: (_request, _response, next) => {
        requestLoggerCalls++;
        next();
      },
      health: new Health(),
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

  function postImage(query: string, body: Uint8Array<ArrayBuffer>) {
    return fetch(`${baseUrl}/resize${query}`, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
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
