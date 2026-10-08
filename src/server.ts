import express from "express";
import { pipeline } from "node:stream";
import sharp from "sharp";

export function createServer() {
  const app = express();

  app.get(["/", "/health"], (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // curl -X POST -d @Test.png localhost:8080/resize
  // curl -X POST -H "Content-Type: image/png" --data-binary @Test.png localhost:8080/resize
  app.post("/resize", async (req, res) => {
    res.type("image/png");
    await pipeline(req, sharp().resize({ width: 200 }).png(), res, (err) => {
      if (err) {
        console.error(`Pipeline error: ${err.message}`);
        res.status(500).json({ status: "error", message: err.message });
      }
    });
  });

  return app;
}
