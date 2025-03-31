const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
  console.log("Connectedd to the server");
  ws.send("Hello");
};

ws.onmessage = (e) => {
  console.log(`Recieved Message: ${e.data}`);
};

ws.onclose = () => {
  console.log("disconnecte");
};
