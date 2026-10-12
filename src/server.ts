import type { RequestLogger } from "@christian-wechsel/logger-middleware";
import type { Request } from "express";
import express from "express";
import { pipeline } from "node:stream/promises";
import sharp, { type FitEnum } from "sharp";
import type { Health } from "./core/health.js";
import { getApiKeyMiddleware } from "./middleware/api-key.js";

type ResizeOptions = Partial<{
  width: number;
  height: number;
  fit: keyof FitEnum;
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

  // don't log health check requests
  app.get(["/health"], async (_req, res) => {
    const status = await health.getStatus();
    res.status(status === "ok" ? 200 : 503);
    res.json({ status, log: health.getLog() });
  });

  app.use(getApiKeyMiddleware(apiKey));
  app.use(requestLogger);

  // curl -X POST -d @Test.png localhost:8080/resize --output resized.png
  // curl -X POST -H "Content-Type: image/png" --data-binary @Test.png localhost:8080/resize --output resized.png
  // Test ob API Key funktioniert
  // curl -i -X POST -H "Content-Type: image/png" --data-binary @Test.png localhost:8080/resize
  // curl -i -X POST -H "Content-Type: image/png" -H "Authorization: Bearer your-api-key" --data-binary @Test.png localhost:8080/resize
  app.post("/resize", async (req, res) => {
    const resizeOptions: ResizeOptions = getResizeOptions(req);

    res.type("image/png");
    await pipeline(req, sharp().resize(resizeOptions).png(), res);
  });

  return app;
}

function getResizeOptions(req: Request): ResizeOptions {
  const queryParamWidth = req.query.width;
  const queryParamHeight = req.query.height;
  const resizeOptions: ResizeOptions = {
    width: 200,
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
  return resizeOptions;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
