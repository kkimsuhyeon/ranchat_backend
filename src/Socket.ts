import WebSocket, { Server as WebServer } from "ws";
import { IncomingMessage, Server } from "http";
import { parse } from "url";

class Socket {
  wss: WebServer;

  constructor(server: Server) {
    this.wss = new WebServer({ path: "/ws", noServer: true });

    server.on("upgrade", (request: IncomingMessage, socket, head) => {
      const { pathname } = parse(request.url as string);

      if (pathname === "/ws") {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.initWebServer();
          this.wss.emit("connection", ws, request);
        });
      }
      if (pathname === "/graphql") {
      } else {
        socket.destroy();
      }
    });
  }

  private initWebServer() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("connect");

      ws.on("message", (message: string) => {
        console.log("message", message);
      });
    });

    this.wss.on("close", (error: any) => {
      console.log(error);
    });

    this.wss.on("error", (error) => {
      console.log(error);
    });
  }
}

export default Socket;
