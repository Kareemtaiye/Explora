const ws = require("ws");

const wss = new ws.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Ws is running with new new client connected");

  ws.send("Hello from websocket sevrer");

  ws.on("message", (message) => {
    console.log("Message recieved: " + message);
  });

  ws.on("close", () => {
    console.log("client disconnected");
  });
});

console.log("Websocket server running on ws://localhost:8080 ");
