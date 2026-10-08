import { createServer } from "./server.js";

const app = createServer();
const port = parseInt(process.env.PORT ?? "8080");

app.listen(port, () => {
  console.log(`Image Resizer: listening on port ${port}`);
});
