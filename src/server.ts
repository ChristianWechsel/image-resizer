import type { Request } from "express";
import express from "express";
import { pipeline } from "node:stream";
import sharp, { type FitEnum } from "sharp";

type ResizeOptions = Partial<{
  width: number;
  height: number;
  fit: keyof FitEnum;
}>;

export function createServer() {
  const app = express();

  app.get(["/", "/health"], (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // curl -X POST -d @Test.png localhost:8080/resize
  // curl -X POST -H "Content-Type: image/png" --data-binary @Test.png localhost:8080/resize
  app.post("/resize", async (req, res) => {
    const resizeOptions: ResizeOptions = getResizeOptions(req);

    res.type("image/png");
    await pipeline(req, sharp().resize(resizeOptions).png(), res, (err) => {
      if (err) {
        res.status(500).json({ status: "error", message: err.message });
      }
    });
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
