import CustomWebServer from "./class/CustomWebServer";
import CustomWebSocket from "./class/CustomWebSocket";

class Socket {
  wss: CustomWebServer;
  room: CustomWebServer;

  constructor() {
    if (this.wss === undefined) this.initWebServer();
  }

  private initWebServer() {
    this.wss = new CustomWebServer({ port: 4001, path: "/test" });

    this.wss.on("connection", (ws: CustomWebSocket) => {
      ws.on("message", (event) => {
        const data = JSON.parse(event.toString());

        if (data.type === "subscribe") {
          ws.status = data.type;
          ws.channel = data.channel;
        }

        if (data.type === "unsubscribe") {
          ws.status = data.type;
          ws.channel = undefined;
        }

        if (data.type === "push") {
          this.wss.clients.forEach((socket) => {
            if (socket.status === "subscribe") {
              if (socket.channel === data.channel) {
                socket.send("test");
              }
            }
          });
        }
      });
    });
  }
}

export default Socket;
