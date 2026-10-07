import express from "express";
const app = express();

app.get(["/", "/health"], (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const port = parseInt(process.env.PORT ?? "8080");
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});
