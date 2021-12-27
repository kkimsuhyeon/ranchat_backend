import { Server, ServerOptions } from "ws";

import CustomWebSocket from "./CustomWebSocket";

class CustomWebServer extends Server {

    clients: Set<CustomWebSocket>;

    constructor(options: ServerOptions) {
        super(options)
    }

}

export default CustomWebServer