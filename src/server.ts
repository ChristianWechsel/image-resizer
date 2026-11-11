import type { RequestLogger } from "@christian-wechsel/logger-middleware";
import type { Request } from "express";
import express from "express";
import { pipeline } from "node:stream/promises";
import sharp, { type FitEnum, type Sharp } from "sharp";
import type { Health } from "./core/health.js";
import { getApiKeyMiddleware } from "./middleware/api-key.js";
import { contentSizeLimit } from "./middleware/content-size.js";

type ResizeOptions = Partial<{
  width: number;
  height: number;
  fit: keyof FitEnum;
  format: "png" | "jpeg";
}>;

export function createServer({
  requestLogger,
  health,
  apiKey,
}: {
  requestLogger: ReturnType<RequestLogger["createRequestLogger"]>;
  health: Health;
  apiKey: string;
}) {
  const app = express();
  app.disable("x-powered-by");

  // don't log health check requests
  app.get(["/health"], async (_req, res) => {
    const status = await health.getStatus();
    res.status(status === "ok" ? 200 : 503);
    res.json({ status });
  });

  // curl -X POST -d @Test.png localhost:8080/resize --output resized.png
  // curl -X POST -H "Content-Type: image/png" --data-binary @Test.png localhost:8080/resize --output resized.png
  // Test ob API Key funktioniert
  // curl -i -X POST -H "Content-Type: image/png" --data-binary @Test.png localhost:8080/resize
  // curl -i -X POST -H "Content-Type: image/png" -H "Authorization: Bearer your-api-key" --data-binary @Test.png localhost:8080/resize
  app.post(
    "/resize",
    contentSizeLimit(),
    getApiKeyMiddleware(apiKey),
    requestLogger,
    async (req, res) => {
      const resizeOptions: ResizeOptions = getResizeOptions(req);

      res.type(`image/${resizeOptions.format}`);
      await pipeline(req, factoryResize(resizeOptions), res);
    },
  );

  return app;
}

function getResizeOptions(req: Request): ResizeOptions {
  const queryParamWidth = req.query.width;
  const queryParamHeight = req.query.height;
  const queryParamFormat = req.query.format;
  const resizeOptions: ResizeOptions = {
    width: 200,
    format: "png",
  };

  let widthProvided = false;
  let heightProvided = false;

  if (isString(queryParamWidth)) {
    resizeOptions.width = parseInt(queryParamWidth);
    widthProvided = true;
  }
  if (isString(queryParamHeight)) {
    resizeOptions.height = parseInt(queryParamHeight);
    heightProvided = true;
  }
  if (widthProvided && heightProvided) {
    resizeOptions.fit = "fill";
  }
  if (isFormat(queryParamFormat)) {
    resizeOptions.format = queryParamFormat;
  }
  return resizeOptions;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isFormat(value: unknown): value is "png" | "jpeg" {
  if (!isString(value)) {
    return false;
  }
  return value === "png" || value === "jpeg";
}

function factoryResize(options: ResizeOptions): Sharp {
  let transformer = sharp().resize(options);
  if (options.format === "png") {
    transformer = transformer.png();
  } else if (options.format === "jpeg") {
    transformer = transformer.jpeg();
  }
  return transformer;
}
