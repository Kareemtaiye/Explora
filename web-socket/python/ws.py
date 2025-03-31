from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("Hello from the ws server")

    while True:
        data = await websocket.receive_text()
        print(f"Recieved: {data}")
        await websocket.send_text(f"You said: {data}")