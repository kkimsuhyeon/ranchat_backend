import { WebSocket } from "ws";

class CustomWebSocket extends WebSocket {

    status: string; // sub, unSub
    channel: string | undefined; // room, chatting 

    constructor(url: string) {
        super(url);
    }

}

export default CustomWebSocket;