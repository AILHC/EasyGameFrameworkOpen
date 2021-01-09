
import { Server } from "ws"
const wss = new Server({ port: 8181 });
wss.on('connection', function (ws) {
    console.log('client connected');
    
    ws.on('message', function (message) {
        console.log(message);
    });
});