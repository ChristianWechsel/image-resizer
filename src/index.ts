import { createServer } from "./server.js";

const app = createServer();
const port = parseInt(process.env.PORT ?? "8080");

const server = app.listen(port, () => {
  console.log(`Image Resizer: listening on port ${port}`);
});

server.on("close", () => {
  console.log("Image Resizer: server closed");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Image Resizer: shutting down gracefully");
  server.close();
});

process.on("SIGKILL", () => {
  console.log("Image Resizer: received SIGKILL, shutting down immediately");
  process.exit(1);
});
