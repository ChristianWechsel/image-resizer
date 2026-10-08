import express from "express";

export function createServer() {
  const app = express();

  app.get(["/", "/health"], (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // curl -X POST -d @Test.png localhost:8080/resize
  app.post("/resize", (req, res) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      const imageBuffer = Buffer.concat(chunks);
      console.log(`Received image buffer of size: ${imageBuffer.length}`);
      res.status(200).json({ status: "resize endpoint" });
    });
    req.on("error", (err) => {
      console.error(`Error receiving data: ${err.message}`);
    });
  });

  return app;
}
