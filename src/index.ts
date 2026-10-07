import express from "express";
const app = express();

app.get(["/", "/health"], (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/resize", (_req, res) => {
  res.status(200).json({ status: "resize endpoint" });
});

const port = parseInt(process.env.PORT ?? "8080");
app.listen(port, () => {
  console.log(`Image Resizer: listening on port ${port}`);
});
