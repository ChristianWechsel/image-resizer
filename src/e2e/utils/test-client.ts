import { createServer, Server } from "http";

export class TestClient {
  private server: Server;

  constructor() {
    this.server = createServer();
  }

  getServer() {
    return this.server;
  }

  startServer(config: { host: string; port: number }) {
    return new Promise<void>((resolve, reject) => {
      this.server.once("listening", () => {
        console.log(
          `Server is listening at http://${config.host}:${config.port}`,
        );
        resolve();
      });
      this.server.once("error", (err) => {
        console.error(`Server error: ${err.message}`);
        reject(err);
      });
      this.server.listen(config.port, config.host);
    });
  }

  closeServer() {
    return new Promise<void>((resolve, reject) => {
      this.server.once("close", () => {
        console.log("Server has been closed");
        resolve();
      });
      this.server.once("error", (err) => {
        console.error(`Server error: ${err.message}`);
        reject(err);
      });
      this.server.close();
    });
  }
}
